import { ValidationError, NotFoundError } from "../../../../shared/errors/domain.errors.js";
import { PAYMENT_ERROR_CODES } from "../../domain/payment.enum.js";

export class HandleWebhook {
	constructor({ paymentRepository, paymentGatewayRegistry, processSuccessfulPayment, fundWalletFromTransfer, auditService }) {
		this.fundWalletFromTransfer = fundWalletFromTransfer;
		this.paymentRepository = paymentRepository;
		this.paymentGatewayRegistry = paymentGatewayRegistry;
		this.processSuccessfulPayment = processSuccessfulPayment;
		this.auditService = auditService;
	}

	async execute({ gateway, rawBody, signature, payload }) {
		const provider = this.paymentGatewayRegistry.get(gateway);

		if (!provider.verifyWebhookSignature(rawBody, signature)) {
			throw new ValidationError("Invalid webhook signature", PAYMENT_ERROR_CODES.INVALID_WEBHOOK_SIGNATURE);
		}

		const event = provider.parseWebhookEvent(payload);
		if (!event) {
			return { handled: false, reason: "unrecognized_event" }; // not every webhook event type matters to us — no-op, not an error
		}

		if (event.kind === "wallet_funding") {
			return this.fundWalletFromTransfer.execute({
				reference: event.reference, amountKobo: event.amountKobo,
				accountNumber: event.accountNumber, customerCode: event.customerCode, senderName: event.senderName
			});
		}

		const payment = await this.paymentRepository.findByGatewayReference(event.reference);
		if (!payment) {
			// A webhook for a reference we don't recognize is suspicious but not our fault to crash on —
			// log and acknowledge so the gateway stops retrying a payment we'll never find.
			console.error(`[HandleWebhook] No payment found for reference: ${event.reference}`);
			return { handled: false, reason: "payment_not_found" };
		}

		if (event.status === "successful") {
			const result = await this.processSuccessfulPayment.execute({
				payment, gatewayData: { channel: event.channel, authorization: event.authorization }
			});
			return { handled: true, ...result };
		}

		if (event.status === "failed") {
			payment.markFailed("Gateway reported charge failure");
			await this.paymentRepository.update(payment.id, payment);

			if (this.auditService) {
				await this.auditService.log({
					actorId: null, actorType: "system", action: "PAYMENT_FAILED", entity: "Payment", entityId: payment.id
				});
			}
			return { handled: true, payment };
		}

		return { handled: false, reason: "unhandled_status" };
	}
}
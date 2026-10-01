import { NotFoundError, ValidationError } from "../../../../shared/errors/domain.errors.js";
import { PAYMENT_ERROR_CODES } from "../../domain/payment.enum.js";

export class VerifyPayment {
	constructor({ paymentRepository, paymentGatewayRegistry, processSuccessfulPayment }) {
		this.paymentRepository = paymentRepository;
		this.paymentGatewayRegistry = paymentGatewayRegistry;
		this.processSuccessfulPayment = processSuccessfulPayment;
	}

	async execute({ userId, reference }) {
		const payment = await this.paymentRepository.findByGatewayReference(reference);
		if (!payment) throw new NotFoundError("Payment not found", PAYMENT_ERROR_CODES.PAYMENT_NOT_FOUND);
		if (payment.userId !== userId) throw new ValidationError("You do not have access to this payment");

		if (payment.isSuccessful()) {
			return { status: payment.status, payment, alreadyProcessed: payment.businessProcessed };
		}

		const provider = this.paymentGatewayRegistry.get(payment.gateway);
		const result = await provider.verifyTransaction(reference);

		if (result.status === "successful") {
			const processed = await this.processSuccessfulPayment.execute({ payment, gatewayData: { channel: result.raw?.channel } });
			return { status: "successful", payment: processed.payment, subscription: processed.subscription };
		}

		if (result.status === "failed") {
			payment.markFailed("Gateway verification returned failed status");
			const updated = await this.paymentRepository.update(payment.id, payment);
			return { status: "failed", payment: updated };
		}

		return { status: "pending", payment };
	}
}
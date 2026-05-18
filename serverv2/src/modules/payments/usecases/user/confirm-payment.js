import { ValidationError } from "../../../../shared/errors/validation-error.js";
import { NotFoundError } from "../../../../shared/errors/not-found-error.js";
import { AppError } from "../../../../shared/errors/app-error.js";

export class ConfirmPaymentUseCase {
	constructor({
		paymentRepository,
		paystackPaymentService,
		createSubscriptionUseCase,
		renewSubscriptionUseCase,
		upgradeSubscriptionUseCase
	}) {
		this.paymentRepository = paymentRepository;
		this.paystackPaymentService = paystackPaymentService;
		this.createSubscriptionUseCase = createSubscriptionUseCase;
		this.renewSubscriptionUseCase = renewSubscriptionUseCase;
		this.upgradeSubscriptionUseCase = upgradeSubscriptionUseCase;
	}

	// ==============================
	// CONFIRM PAYMENT
	// ==============================
	async execute({ reference }) {
		if (!reference) {
			throw new ValidationError("Payment reference is required");
		}

		// -----------------------------
		// FETCH PAYMENT
		// -----------------------------
		const payment = await this.paymentRepository.findByGatewayReference(reference);

		if (!payment) {
			throw new NotFoundError("Payment not found");
		}

		// -----------------------------
		// IDEMPOTENCY
		// -----------------------------
		if (payment.isSuccessful()) {
			return { payment, alreadyProcessed: true };
		}

		// -----------------------------
		// VERIFY WITH PAYSTACK
		// -----------------------------
		const result = await this.paystackPaymentService.paystackGateway.verifyTransaction(reference);
		const paidAmount = result.raw.amount / 100;

		// -----------------------------
		// AMOUNT VALIDATION
		// -----------------------------
		if (result.status === "successful" && paidAmount !== payment.amount.total) {
			throw new AppError("Amount mismatch", 400);
		}

		// -----------------------------
		// SAVE REAL PAYMENT CHANNEL
		// -----------------------------
		payment.paymentChannel = result.raw.channel || null;

		// -----------------------------
		// AUTO-RENEW SUPPORT
		// -----------------------------
		const authorization = result.raw.authorization;
		if (authorization?.reusable) {
			payment.autoRenewEnabled = true;
			payment.authorizationReusable = true;
			payment.authorizationCode = authorization.authorization_code;
		}

		// -----------------------------
		// UPDATE PAYMENT STATUS
		// -----------------------------
		if (result.status === "successful") {
			payment.markSuccessful();
		} else if (result.status === "failed") {
			payment.markFailed("Gateway verification failed");
		} else {
			// keep pending
			payment.status = "pending";
		}

		// -----------------------------
		// PROCESS SUBSCRIPTION BASED ON ACTION
		// -----------------------------
		switch (payment.actionType) {
			case "new_subscription":
				await this.createSubscriptionUseCase.execute({
					accountId: payment.accountId,
					userId: payment.userId,
					planId: payment.planId,
					paymentId: payment.id,
					cycles: payment.cycles
				});
				break;

			case "renewal":
				await this.renewSubscriptionUseCase.execute({
					accountId: payment.accountId,
					paymentId: payment.id,
					cycles: payment.cycles
				});
				break;

			case "upgrade":
				await this.upgradeSubscriptionUseCase.execute({
					accountId: payment.accountId,
					newPlanId: payment.planId, // assume planId is the new plan
					paymentId: payment.id
				});
				break;

			default:
				throw new AppError(`Unsupported payment action: ${payment.actionType}`);
		}

		// -----------------------------
		// SAVE PAYMENT
		// -----------------------------
		const updatedPayment = await this.paymentRepository.update(payment);

		return { payment: updatedPayment, alreadyProcessed: false, gatewayResponse: result };
	}
}
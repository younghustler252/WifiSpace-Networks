import { ValidationError } from "../../../../shared/errors/validation-error.js";
import { NotFoundError } from "../../../../shared/errors/not-found-error.js";

export class ConfirmPaymentUseCase {
	constructor({
		paymentRepository,
		paystackPaymentService,
		createSubscriptionUseCase,
		accountRepository
	}) {
		this.paymentRepository = paymentRepository;
		this.paystackPaymentService = paystackPaymentService;
		this.createSubscriptionUseCase = createSubscriptionUseCase;
		this.accountRepository = accountRepository;
	}

	async execute({ transactionId }) {
		if (!transactionId) {
			throw new ValidationError("Transaction ID is required");
		}

		// ----------------------------
		// FIND PAYMENT
		// ----------------------------
		const existingPayment =
			await this.paymentRepository.findByTransactionId(
				transactionId
			);

		if (!existingPayment) {
			throw new NotFoundError("Payment not found");
		}

		// ----------------------------
		// VERIFY WITH PAYSTACK
		// ----------------------------
		const {
			payment,
			alreadyProcessed
		} = await this.paystackPaymentService.verifyPayment(
			transactionId
		);

		// ----------------------------
		// SUCCESS FLOW (IDEMPOTENT)
		// ----------------------------
		if (payment.status === "successful" && !alreadyProcessed) {
			await this.createSubscriptionUseCase.execute({
				accountId: payment.accountId,
				planId: payment.planId,
				cycles: payment.cycles,
				bonusDays: payment.bonusDays
			});
			// OPTIONAL (keep light or async later)
			const account =
				await this.accountRepository.findById(
					payment.accountId
				);

			// 👉 future: trigger provisioning event instead
		}

		return payment;
	}
}
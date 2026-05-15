import { ValidationError } from "../../../../shared/errors/validation-error.js";
import { NotFoundError } from "../../../../shared/errors/not-found-error.js";

export class AdminUpdatePaymentStatusUseCase {
	constructor({
		paymentRepository,
		createSubscriptionUseCase,
		accountRepository
	}) {
		this.paymentRepository = paymentRepository;
		this.createSubscriptionUseCase = createSubscriptionUseCase;
		this.accountRepository = accountRepository;
	}

	async execute({ paymentId, status }) {
		if (!paymentId) {
			throw new ValidationError("Payment ID is required");
		}

		const allowed = [
			"pending",
			"successful",
			"failed",
			"expired"
		];

		if (!allowed.includes(status)) {
			throw new ValidationError("Invalid payment status");
		}

		const payment =
			await this.paymentRepository.findById(paymentId);

		if (!payment) {
			throw new NotFoundError("Payment not found");
		}

		// ----------------------------
		// IDENTITY GUARD (IMPORTANT)
		// ----------------------------
		if (payment.status === status) {
			return payment;
		}

		// ----------------------------
		// UPDATE STATUS
		// ----------------------------
		const updated =
			await this.paymentRepository.updateStatus(
				paymentId,
				status
			);

		// ----------------------------
		// BUSINESS LOGIC ONLY IF SUCCESSFUL
		// ----------------------------
		if (status === "successful") {
			// prevent double processing safety
			await this.handleSuccessfulPayment(payment);
		}

		return updated;
	}

	// ==============================
	// SIDE EFFECTS HANDLER
	// ==============================
	async handleSuccessfulPayment(payment) {
		// prevent duplicate execution
		if (payment.processed === true) return;

		// mark processed (optional field strongly recommended)
		await this.paymentRepository.markProcessed(payment.id);

		// create subscription
		await this.createSubscriptionUseCase.execute({
			accountId: payment.accountId,
			planId: payment.planId
		});

		// optional: MikroTik provisioning (better move to event later)
		const account =
			await this.accountRepository.findById(
				payment.accountId
			);

		if (account) {
			const exists =
				await this.mikrotikService.checkUserExists(
					account.wsnId,
					account.serviceType
				);

			if (!exists) {
				await this.mikrotikService.createUser({
					wsId: account.wsnId,
					password:
						account.pppoePassword || "defaultPass123",
					profile: account.routerProfile || "default",
					serviceType: account.serviceType
				});
			}
		}
	}
}
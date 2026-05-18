import { ValidationError } from "../../../../shared/errors/validation-error.js";

export class AdminRenewSubscriptionUseCase {
	constructor({
		adminRecordPaymentUseCase, // <-- renamed to match our entity
		renewSubscriptionUseCase,
		provisionNetworkAccountUseCase // <-- optional provisioning
	}) {
		this.adminRecordPaymentUseCase = adminRecordPaymentUseCase;
		this.renewSubscriptionUseCase = renewSubscriptionUseCase;
		this.provisionNetworkAccountUseCase = provisionNetworkAccountUseCase;
	}

	async execute({
		userId,
		accountId,
		planId,
		amount,             // { total, base, discount }
		cycles = 1,
		transactionId,      // optional, if you need for idempotency
		notes,
		context = {}
	}) {
		// -----------------------------
		// 1. RECORD PAYMENT
		// -----------------------------
		if (!amount || typeof amount.total !== "number" || amount.total <= 0) {
			throw new ValidationError("Invalid payment amount");
		}

		const payment = await this.adminRecordPaymentUseCase.execute({
			userId,
			accountId,
			planId,
			amount,
			adminNote: notes
		});

		// -----------------------------
		// 2. RENEW SUBSCRIPTION
		// -----------------------------
		const subscription = await this.renewSubscriptionUseCase.execute({
			accountId,
			paymentId: payment.id,
			cycles
		});

		// -----------------------------
		// 3. PROVISION NETWORK ACCOUNT (if applicable)
		// -----------------------------
		if (this.provisionNetworkAccountUseCase) {
			try {
				await this.provisionNetworkAccountUseCase.execute(subscription.id, context);
				// update Mikrotik status on subscription
				subscription.markSynced();
			} catch (err) {
				console.error("Provisioning failed:", err.message);
				subscription.markSyncFailed(err.message);
			}
		}

		return {
			payment,
			subscription
		};
	}
}
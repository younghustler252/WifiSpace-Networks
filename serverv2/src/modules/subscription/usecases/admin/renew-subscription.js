export class AdminRenewSubscriptionUseCase {
	constructor({
		adminCreatePaymentUseCase,
		renewSubscriptionUseCase
	}) {
		this.adminCreatePaymentUseCase = adminCreatePaymentUseCase;
		this.renewSubscriptionUseCase = renewSubscriptionUseCase;
	}

	async execute({
		userId,
		accountId,
		planId,
		amount,
		cycles = 1,
		transactionId,
		notes
	}) {
		// 1. record payment
		const payment = await this.adminCreatePaymentUseCase.execute({
			userId,
			accountId,
			planId,
			amount,
			cycles,
			transactionId,
			notes
		});

		// 2. renew subscription using payment
		const subscription =
			await this.renewSubscriptionUseCase.execute({
				accountId,
				paymentId: payment.id,
				cycles
			});

		return {
			payment,
			subscription
		};
	}
}
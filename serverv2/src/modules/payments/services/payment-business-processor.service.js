export class PaymentBusinessProcessor {
	constructor({
		subscriptionService,
		subscriptionRepository, // NEW — needed to reload an existing subscription on retry
		networkService,
		accountRepository,
		paymentRepository,
		userRepository,
		planRepository
	}) {
		this.subscriptionService = subscriptionService;
		this.subscriptionRepository = subscriptionRepository;
		this.networkService = networkService;
		this.accountRepository = accountRepository;
		this.paymentRepository = paymentRepository;
		this.userRepository = userRepository;
		this.planRepository = planRepository;
	}

	async process(payment) {
		if (!payment) throw new Error("Payment is required");
		if (!payment.isSuccessful()) return payment;

		const user = await this.userRepository.findById(payment.userId);
		const plan = await this.planRepository.findById(payment.planId);

		if (!user) throw new Error("User missing on payment");
		if (!plan) throw new Error("Plan missing on payment");
		if (!payment.accountId) throw new Error("Payment missing accountId (must be set by checkout flow)");

		const account = await this.accountRepository.findById(payment.accountId);
		if (!account) throw new Error(`Account not found for id ${payment.accountId}`);

		// CHANGED: this is the actual fix. Previously, `businessProcessed`
		// being true made ConfirmPaymentUseCase skip this entire method
		// forever — meaning a payment that succeeded but failed activation
		// could never be retried by anything (webhook redelivery, user
		// refreshing, admin reprocess) without a manual DB edit.
		//
		// Now: if the subscription already exists (businessProcessed was
		// true, meaning subscription creation already ran), reload it
		// instead of recreating/re-renewing it — but still fall through to
		// attempt activation below, every time. Activation retrying is safe:
		// hotspotService.createUser() already handles "already exists"
		// gracefully, and if it's genuinely already synced, re-running it
		// is a wasted RouterOS call at worst, not a correctness problem.
		let subscription;
		if (payment.businessProcessed && payment.subscriptionId) {
			subscription = await this.subscriptionRepository.findById(payment.subscriptionId);
			if (!subscription) {
				throw new Error(`Payment ${payment.id} marked businessProcessed but subscription ${payment.subscriptionId} not found`);
			}
		} else {
			const subscriptionResult = await this.subscriptionService.process({ payment, account, user, plan });
			subscription = subscriptionResult.subscription;
		}

		const metadata = payment.metadata || {};

		// Always attempted now — this is the retry. No separate endpoint,
		// no separate code path to keep in sync with this one.
		const activation = await this.networkService.activate(subscription, metadata);
		if (!activation.success) {
			console.error(
				`[PaymentBusinessProcessor] Activation failed for subscription ${subscription.id}:`,
				activation.error
			);
		}

		payment.businessProcessed = true;
		if (subscription?.id) payment.attachSubscription(subscription.id);
		await this.paymentRepository.update(payment);

		return {
			success: activation.success,
			autoConnected: activation.result?.activation?.autoConnected ?? false,
			user,
			account,
			subscription,
			activation
		};
	}
}
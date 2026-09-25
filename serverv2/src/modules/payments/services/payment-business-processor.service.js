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
			autoConnected: activation.result?.autoConnected ?? false,
			user,
			account,
			subscription,
			activation
		};
	}
}
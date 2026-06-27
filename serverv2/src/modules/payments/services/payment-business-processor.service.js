export class PaymentBusinessProcessor {
	constructor({
		subscriptionService,
		serviceActivationService,
		paymentRepository,
		userRepository,
		planRepository
	}) {
		this.subscriptionService = subscriptionService;
		this.serviceActivationService = serviceActivationService;
		this.paymentRepository = paymentRepository;
		this.userRepository = userRepository;
		this.planRepository = planRepository;
	}

	async process(payment) {
		if (!payment) throw new Error("Payment is required");
		if (!payment.isSuccessful()) return payment;
		if (payment.businessProcessed) return payment;

		const user = await this.userRepository.findById(payment.userId);
		const plan = await this.planRepository.findById(payment.planId);

		if (!user) throw new Error("User missing on payment");
		if (!plan) throw new Error("Plan missing on payment");

		const metadata = payment.metadata || {};
		if (!payment.accountId) throw new Error("Payment missing accountId (must be set by checkout flow)");

		const account = { id: payment.accountId };

		const subscriptionResult = await this.subscriptionService.process({
			payment,
			account,
			user,
			plan
		});
		const subscription = subscriptionResult.subscription;

		let activation = null;
		try {
			activation = await this.serviceActivationService.activate({
				account,
				user,
				plan,
				subscription,
				metadata
			});
		} catch (activationError) {
			console.error("[PaymentBusinessProcessor] Real-time activation bypass failed:", activationError.message);
			activation = { success: false, error: activationError.message };
		}

		payment.businessProcessed = true;
		if (subscription?.id) {
			payment.attachSubscription(subscription.id);
		}

		await this.paymentRepository.update(payment);

		return {
			success: activation?.success !== false,
			account,
			subscription,
			activation
		};
	}
}

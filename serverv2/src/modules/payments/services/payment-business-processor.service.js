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

	// =====================================================
	// MAIN ENTRY POINT
	// =====================================================
	async process(payment) {

		if (!payment) {
			throw new Error("Payment is required");
		}

		if (!payment.isSuccessful()) {
			return payment;
		}

		if (payment.businessProcessed) {
			return payment;
		}

		// =====================================================
		// LOAD CORE DATA (SAFE GUARD ONLY)
		// =====================================================
		const user =
			await this.userRepository.findById(payment.userId);

		const plan =
			await this.planRepository.findById(payment.planId);

		if (!user) {
			throw new Error("User missing on payment");
		}

		if (!plan) {
			throw new Error("Plan missing on payment");
		}

		const metadata = payment.metadata || {};

		// =====================================================
		// ACCOUNT IS ALREADY RESOLVED BY CHECKOUT FLOW
		// =====================================================
		if (!payment.accountId) {
			throw new Error("Payment missing accountId (must be set by checkout flow)");
		}

		const account = {
			id: payment.accountId
		};

		// =====================================================
		// 1. SUBSCRIPTION LIFECYCLE
		// =====================================================
		const subscriptionResult =
			await this.subscriptionService.process({
				payment,
				account,
				user,
				plan
			});

		const subscription = subscriptionResult.subscription;

		// =====================================================
		// 2. SERVICE ACTIVATION
		// =====================================================
		const activation =
			await this.serviceActivationService.activate({
				account,
				user,
				plan,
				subscription,
				metadata
			});

		// =====================================================
		// 3. MARK PAYMENT AS PROCESSED
		// =====================================================
		payment.businessProcessed = true;

		if (subscription?.id) {
			payment.attachSubscription(subscription.id);
		}

		await this.paymentRepository.update(payment);

		// =====================================================
		// FINAL RESPONSE
		// =====================================================
		return {
			success: true,
			account,
			subscription,
			activation
		};
	}
}
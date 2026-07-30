export class PaymentBusinessProcessor {
	constructor({
		subscriptionService,
		networkService, // CHANGED: was serviceActivationEngine — matches the actual class name now
		accountRepository,
		paymentRepository,
		userRepository,
		planRepository
	}) {
		this.subscriptionService = subscriptionService;
		this.networkService = networkService;
		this.accountRepository = accountRepository;
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
		if (!payment.accountId) throw new Error("Payment missing accountId (must be set by checkout flow)");

		// Real fetch, not a fabricated { id: payment.accountId } stub — see
		// earlier notes, this was likely the single biggest silent-failure bug.
		const account = await this.accountRepository.findById(payment.accountId);
		if (!account) throw new Error(`Account not found for id ${payment.accountId}`);

		const metadata = payment.metadata || {};

		const subscriptionResult = await this.subscriptionService.process({ payment, account, user, plan });
		const subscription = subscriptionResult.subscription;

		// This is the ONE place activation gets triggered for the payment flow.
		// CreateSubscriptionUseCase/RenewSubscriptionUseCase no longer call the
		// engine themselves — subscriptionService.process() just creates/renews
		// the record; this call is what actually reaches the router.
		//
		// metadata is passed through because hotspot activation needs it
		// (macAddress, routerId, ipAddress — these come from the captive portal
		// request that led to checkout, carried in payment.metadata since
		// HotspotCheckoutFlow attached it there).
		// NOTE: networkService.activate() never throws — NetworkService._execute
		// catches internally and always resolves to { success, result } or
		// { success: false, error }. No try/catch needed here; just check
		// activation.success.
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
			// CHANGED: autoConnected now lives two levels deep —
			// networkService returns { success, result }, and result is
			// whatever MikrotikManager.provision() returned:
			// { success, account, router, activation: { autoConnected, ... } }.
			autoConnected: activation.result?.activation?.autoConnected ?? false,
			user, // NEW — was loaded but never returned; ConfirmHotspotPurchase needs it downstream
			account,
			subscription,
			activation
		};
	}
}
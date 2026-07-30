export class HotspotCheckoutFlow {
	constructor({
		userRepository,
		planRepository,
		accountResolver,
		createAccount,
		createPayment
	}) {
		this.userRepository = userRepository;
		this.planRepository = planRepository;
		this.accountResolver = accountResolver;
		this.createAccount = createAccount;
		this.createPayment = createPayment;
	}

	async execute({ userId, planId, metadata = {} }) {
		if (!userId) throw new Error("userId is required");
		if (!planId) throw new Error("planId is required");

		const user = await this.userRepository.findById(userId);
		if (!user) throw new Error("User not found");

		const plan = await this.planRepository.findById(planId);
		if (!plan) throw new Error("Plan not found");

		if (plan.serviceType !== "hotspot") {
			throw new Error("Selected plan is not a hotspot plan");
		}

		const resolution = await this.accountResolver.resolve({ user, plan, metadata });

		let account = resolution.account;
		let createdAccount = false;

		if (!account && resolution.needsCreation) {
			const result = await this.createAccount.execute({
				userId: user.id,
				accountType: "personal",
				serviceType: "hotspot",
				routerId: metadata.routerId,
				routerProfile: plan.mikrotikProfile,
				limitUptime: plan.limitUptime
			});

			account = result.account ?? result;
			createdAccount = true;
		}

		if (!account) throw new Error("Unable to resolve hotspot account");

		const payment = await this.createPayment.execute({
			userId: user.id,
			accountId: account.id,
			planId: plan.id,
			
			callbackUrl: `${process.env.FRONTEND_URL}/hotspot/callback`,
			metadata: {
				...metadata,
				serviceType: "hotspot",
				accountId: account.id
			}
		});

		return {
			status: createdAccount ? "CREATED_ACCOUNT" : "READY",
			user,
			account,
			plan,
			payment
		};
	}
}
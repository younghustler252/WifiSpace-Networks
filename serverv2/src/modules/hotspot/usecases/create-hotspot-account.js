export class CreateHotspotAccount {
	constructor({
		accountRepository,
		createAccount,
		createSubscription,
		routerRepository,
		paymentRepository
	}) {
		this.accountRepository = accountRepository;
		this.createAccount = createAccount;
		this.createSubscription = createSubscription;
		this.routerRepository = routerRepository;
		this.paymentRepository = paymentRepository;
	}

	async execute(payment) {

		// -----------------------------------
		// 1. Extract metadata
		// -----------------------------------
		const {
			userId,
			planId,
			accountId,
			id: paymentId,
			metadata = {}
		} = payment;

		const {
			routerId,
			routerIp,
			phone,
			firstName,
			email
		} = metadata;

		// -----------------------------------
		// 2. Resolve router
		// -----------------------------------
		const router =
			await this.routerRepository
				.findRouterForHotspot({
					routerId,
					routerIp
				});

		if (!router) {
			throw new Error("No router found for hotspot account");
		}

		// -----------------------------------
		// 3. Create Account
		// -----------------------------------
		const { account } =
            await this.createAccount.execute(
                // { id: "SYSTEM" },
                {
                    userId,
                    accountType: "personal",
                    serviceType: "hotspot",
                    routerId: router.id,
                    routerPassword: phone
                }
            );

		// -----------------------------------
		// 4. Create Subscription
		// -----------------------------------
		const subscription =
			await this.createSubscription.execute({
				userId,
				accountId: account.id,
				planId,
				cycles: 1
			});

		// -----------------------------------
		// 5. Update payment with accountId
		// -----------------------------------
		payment.accountId = account.id;
		payment.businessProcessed = true;

		await this.paymentRepository.update(
			payment.id,
			payment
		);

		// -----------------------------------
		// 6. Return result
		// -----------------------------------
		return {
			account,
			subscription,
			router
		};
	}
}
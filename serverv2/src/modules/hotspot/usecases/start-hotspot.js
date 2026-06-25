export class StartHotspotPurchase {

	constructor({
		userRepository,
		registerHotspotUser,
		createPayment,
		routerRepository,
		hotspotCheckoutFlow
	}) {
		this.userRepository = userRepository;
		this.registerHotspotUser = registerHotspotUser;
		this.createPayment = createPayment;
		this.routerRepository = routerRepository;
		this.hotspotCheckoutFlow = hotspotCheckoutFlow;
	}


	async execute({
		firstName,
		email,
		phone,

		planId,

		routerId,
		routerUid,
		identity,

		macAddress,
		ipAddress,
		userAgent
	}) {


		// =====================================================
		// 1. FIND USER FIRST
		// =====================================================

		let user =
			await this.userRepository.findByEmail(
				email
			);



		// =====================================================
		// 2. CREATE ONLY IF USER DOES NOT EXIST
		// =====================================================

		if (!user) {

			user =
				await this.registerHotspotUser.execute({
					firstName,
					email,
					phone
				});
		}



		if (!user) {
			throw new Error(
				"Unable to resolve user"
			);
		}



		// =====================================================
		// 3. RESOLVE ROUTER
		// =====================================================

		const router =
			await this.routerRepository.findRouterForHotspot({
				routerId,
				routerUid,
				identity
			});


		if (!router) {
			throw new Error(
				"No available hotspot router found"
			);
		}



		// =====================================================
		// 4. CREATE ACCOUNT + PAYMENT DRAFT
		// =====================================================

		const result =
			await this.hotspotCheckoutFlow.execute({

				userId:
					user.id,

				plan: {
					id: planId,
					serviceType:
						"hotspot"
				},

				metadata: {

					macAddress,
					ipAddress,
					userAgent,

					routerId:
						router.id,

					routerUid:
						router.routerUid,

					routerCode:
						router.code,

					routerStatus:
						router.status
				}
			});

		console.log("hospot check resp",result.paymentDraft)


		// =====================================================
		// 5. PAYMENT
		// =====================================================

		const payment =
			await this.createPayment.execute(
				result.paymentDraft
			);



		return {

			user,

			router,

			payment,

			account:
				result.account,

			status:
				result.status
		};
	}
}
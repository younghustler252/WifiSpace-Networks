export class HotspotCheckoutFlow {

	constructor({
		userRepository,
		accountResolver,
		createAccount
	}) {
		this.userRepository = userRepository;
		this.accountResolver = accountResolver;
		this.createAccount = createAccount;
	}


	async execute({
		userId,
		plan,
		metadata = {}
	}) {


		if (!userId) {
			throw new Error("userId is required");
		}

		if (!plan) {
			throw new Error("plan is required");
		}



		const user =
			await this.userRepository.findById(userId);


		if (!user) {
			throw new Error("User not found");
		}



		const serviceType = "hotspot";



		const resolution =
			await this.accountResolver.resolve({
				user,

				plan:{
					...plan,
					serviceType
				},

				metadata
			});



		let account =
			resolution.account;


		// =====================================================
// 3. CREATE ACCOUNT IF NEEDED
// =====================================================

		let createdAccount = false;


		if (!account && resolution.needsCreation) {


			const result =
				await this.createAccount.execute({

					userId: user.id,

					accountType: "personal",

					serviceType,

					routerId:
						metadata.routerId || null,


					routerPassword:
						metadata.phone || null,


					routerProfile:
						plan.mikrotikProfile || null,


					limitUptime:
						plan.limitUptime || null
				});


			account =
				result.account || result;


			createdAccount = true;
		}



		if(!account){
			throw new Error(
				"Could not resolve hotspot account"
			);
		}




		const paymentDraft = {

			userId:user.id,

			accountId:account.id,

			planId:plan.id,


			metadata:{
				...metadata,

				serviceType,

				accountId:account.id
			}
		};



		return {

			status:
				createdAccount
					? "CREATED_ACCOUNT"
					: "READY",


			account,

			paymentDraft
		};
	}
}
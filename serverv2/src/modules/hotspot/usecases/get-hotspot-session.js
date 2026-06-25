export class GetHotspotSession {

	constructor({
		accountRepository,
		userRepository,
		subscriptionRepository,
		planRepository
	}) {
		this.accountRepository = accountRepository;
		this.userRepository = userRepository;
		this.subscriptionRepository = subscriptionRepository;
		this.planRepository = planRepository;
	}


	async execute({ macAddress, email }) {


		if (!macAddress && !email) {
			throw new Error(
				"MAC address or email is required"
			);
		}


		let user = null;



		// =====================================================
		// 1. EMAIL FIRST
		// =====================================================

		if(email){

			user =
				await this.userRepository.findByEmail(email);
		}




		// =====================================================
		// 2. MAC FALLBACK
		// =====================================================

		if(!user && macAddress){

			const account =
				await this.accountRepository.findByMac(
					macAddress
				);


			if(account){

				user =
					await this.userRepository.findById(
						account.userId
					);
			}
		}





		// =====================================================
		// NEW USER
		// =====================================================

		if(!user){

			return {
				user:null,
				hasUser:false,
				hasHotspotAccount:false,
				accounts:[]
			};
		}





		// =====================================================
		// FIND HOTSPOT ACCOUNT
		// =====================================================

		const account =
			await this.accountRepository.findOne({
				userId:user.id,
				serviceType:"hotspot"
			});




		// =====================================================
		// NO ACCOUNT YET
		// =====================================================

		if(!account){

			return {

				user,

				hasUser:true,

				hasHotspotAccount:false,

				accounts:[]
			};
		}





		const subscription =
			await this.subscriptionRepository.findActiveByAccount(
				account.id
			);


		let plan=null;


		if(subscription?.planId){

			plan =
				await this.planRepository.findById(
					subscription.planId
				);
		}




		return {

			user,

			hasUser:true,

			hasHotspotAccount:true,


			accounts:[
				{
					account,
					subscription,
					plan
				}
			]
		};
	}
}
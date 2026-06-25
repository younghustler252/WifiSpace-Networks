export class AccountResolverService {

	constructor({
		accountRepository
	}) {
		this.accountRepository = accountRepository;
	}


	async resolve({
		user,
		plan,
		metadata = {}
	}) {

		if (!user) {
			throw new Error("User is required");
		}

		if (!plan) {
			throw new Error("Plan is required");
		}


		const serviceType = plan.serviceType;


		// =====================================================
		// 1. EXPLICIT ACCOUNT (OPTIONAL)
		// useful for future PPPoE/business flows
		// =====================================================

		if (metadata.accountId) {

			const account =
				await this.accountRepository.findById(
					metadata.accountId
				);


			if (!account) {
				throw new Error("Account not found");
			}


			if (
				account.userId.toString() !==
				user.id.toString()
			) {
				throw new Error(
					"Account does not belong to user"
				);
			}


			if (
				account.serviceType !== serviceType
			) {
				throw new Error(
					"Account service mismatch"
				);
			}


			return {
				account,
				created: false
			};
		}



		// =====================================================
		// 2. FIND EXISTING ACCOUNT
		// =====================================================

		const account =
			await this.accountRepository.findOne({
				userId: user.id,
				serviceType
			});



		// =====================================================
		// 3. EXISTING ACCOUNT
		// =====================================================

		if (account) {

			return {
				account,
				created: false
			};
		}



		// =====================================================
		// 4. NO ACCOUNT
		// CHECKOUT FLOW WILL CREATE
		// =====================================================

		return {
			account: null,
			created: false,
			needsCreation: true
		};
	}
}
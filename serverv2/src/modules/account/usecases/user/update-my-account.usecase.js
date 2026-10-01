export class UpdateMyAccount {

	constructor({
		accountRepository
	}) {
		this.accountRepository = accountRepository;
	}

	async execute(userId, updateData) {
		const account =
			await this.accountRepository.findByUserId(userId);

		if (!account) {
			throw new Error("Account not found");
		}

		const allowedFields = [
			"businessName",
			"companyRegistrationNumber",
			"taxId",
			"routerPassword"
		];

		for (const key of Object.keys(updateData)) {
			if (!allowedFields.includes(key)) {
				throw new Error(
					`Cannot update field: ${key}`
				);
			}

			account[key] = updateData[key];
		}

		return this.accountRepository.update(
			account.id,
			account
		);
	}
}
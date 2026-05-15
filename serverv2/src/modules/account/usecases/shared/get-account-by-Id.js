	// import { PERMISSION } from "../../../../shared/constants/permissions.js";

	export class GetAccountById {
		constructor(accountRepository) {
			this.accountRepository = accountRepository;
			// this.permissionService = permissionService;
		}

		async execute(accountId) {
			// console.log("accountID", accountId);

			const account = await this.accountRepository.findById(accountId);
			if (!account) throw new Error("Account not found");

			return account;
		}
	}
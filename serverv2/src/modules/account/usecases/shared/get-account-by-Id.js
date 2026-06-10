	// import { PERMISSION } from "../../../../shared/constants/permissions.js";

	export class GetAccountById {
		constructor({accountRepository}) {
			this.accountRepository = accountRepository;
		}

		async execute(accountId) {

			const account = await this.accountRepository.findById(accountId);
			if (!account) throw new Error("Account not found");

			return account;
		}
	}
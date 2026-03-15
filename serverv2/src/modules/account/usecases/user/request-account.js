import { CreateAccountBase } from "../../base/create-account.base.js";

export class CreateAccountSelf extends CreateAccountBase {

	async execute(data) {

		const account = await this._executeCommon(data);

		// ----------------------------
		// Self-requested accounts are always pending
		// ----------------------------
		account.profileStatus = "pending";

		// ----------------------------
		// Save via repository
		// ----------------------------
		const created = await this.accountRepository.create(account);

		return created;
	}

}
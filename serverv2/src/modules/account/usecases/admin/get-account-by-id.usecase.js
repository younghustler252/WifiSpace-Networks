import { NotFoundError } from "../../../../shared/errors/domain.errors.js";
import { ACCOUNT_ERROR_CODES } from "../../domain/account.enum.js";

export class GetAccountById {
	constructor({ accountRepository }) {
		this.accountRepository = accountRepository;
	}

	async execute({ accountId }) {
		const account = await this.accountRepository.findById(accountId);
		if (!account) throw new NotFoundError("Account not found", ACCOUNT_ERROR_CODES.ACCOUNT_NOT_FOUND);
		return account;
	}
}
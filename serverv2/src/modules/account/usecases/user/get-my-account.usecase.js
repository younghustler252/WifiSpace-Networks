import { NotFoundError, ForbiddenError } from "../../../../shared/errors/domain.errors.js";
import { ACCOUNT_ERROR_CODES } from "../../domain/account.enum.js";

export class GetMyAccount {
	constructor({ accountRepository }) {
		this.accountRepository = accountRepository;
	}

	async execute({ userId, accountId }) {
		const account = await this.accountRepository.findById(accountId);
		if (!account) throw new NotFoundError("Account not found", ACCOUNT_ERROR_CODES.ACCOUNT_NOT_FOUND);

		if (account.userId !== userId) {
			throw new ForbiddenError("You do not have access to this account", ACCOUNT_ERROR_CODES.ACCOUNT_NOT_OWNED);
		}

		return account;
	}
}
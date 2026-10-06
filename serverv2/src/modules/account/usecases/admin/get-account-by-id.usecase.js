// account/usecases/admin/get-account-by-id.usecase.js
import { NotFoundError } from "../../../../shared/errors/domain.errors.js";
import { ACCOUNT_ERROR_CODES, SERVICE_TYPES } from "../../domain/account.enum.js";

export class GetAccountById {
	constructor({ accountRepository, routerRepository, subscriptionRepository }) {
		this.accountRepository = accountRepository;
		this.routerRepository = routerRepository;
		this.subscriptionRepository = subscriptionRepository;
	}

	async execute({ accountId }) {
		const account = await this.accountRepository.findById(accountId);
		if (!account) throw new NotFoundError("Account not found", ACCOUNT_ERROR_CODES.ACCOUNT_NOT_FOUND);

		const router = account.serviceType === SERVICE_TYPES.PPPOE && account.routerId
			? await this.routerRepository.findById(account.routerId)
			: null;

		const subscription = await this.subscriptionRepository.findCurrentByAccountId(accountId);

		return { account, router, subscription };
	}
}
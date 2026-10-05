// subscription/usecases/user/get-upgrade-options.usecase.js
import { ForbiddenError, NotFoundError } from "../../../../shared/errors/domain.errors.js";
import { ACCOUNT_ERROR_CODES } from "../../../account/domain/account.enum.js";

export class GetUpgradeOptions {
	constructor({ accountRepository, subscriptionRepository, planRepository }) {
		this.accountRepository = accountRepository;
		this.subscriptionRepository = subscriptionRepository;
		this.planRepository = planRepository;
	}

	async execute({ userId, accountId }) {
		const account = await this.accountRepository.findById(accountId);
		if (!account) throw new NotFoundError("Account not found", ACCOUNT_ERROR_CODES.ACCOUNT_NOT_FOUND);
		if (account.userId !== userId) throw new ForbiddenError("You do not have access to this account");

		const subscription = await this.subscriptionRepository.findCurrentByAccountId(accountId);
		const filter = { status: "active", serviceType: account.serviceType };

		if (subscription?.status === "active") {
			filter.price = { $gt: subscription.planSnapshot.price };
		}

		const { data } = await this.planRepository.paginate({ filter, limit: 100, sort: { price: 1 } });
		return data;
	}
}
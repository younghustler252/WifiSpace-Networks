// account/usecases/admin/sync-ipoe-to-router.usecase.js
import { NotFoundError, ValidationError } from "../../../../shared/errors/domain.errors.js";

export class SyncIpoeToRouter {
	constructor({ accountRepository, subscriptionRepository, networkService, auditService }) {
		this.accountRepository = accountRepository;
		this.subscriptionRepository = subscriptionRepository;
		this.networkService = networkService;
		this.auditService = auditService;
	}

	async execute({ actorId, accountId, ip = null }) {
		const account = await this.accountRepository.findById(accountId);
		if (!account) throw new NotFoundError("Account not found");
		if (account.accessMethod !== "ipoe") throw new ValidationError("Not an IPoE account");

		const subscription = await this.subscriptionRepository.findCurrentByAccountId(accountId);
		if (!subscription) throw new ValidationError("No subscription to sync");

		const result = await this.networkService.activate(subscription, {});

		if (this.auditService) {
			await this.auditService.log({ actorId, action: "IPOE_MANUALLY_SYNCED", entity: "Account", entityId: accountId, newValue: { success: result.success }, ip });
		}

		return result;
	}
}
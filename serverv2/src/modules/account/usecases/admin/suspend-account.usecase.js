// account/usecases/admin/suspend-account.usecase.js — updated
import { NotFoundError } from "../../../../shared/errors/domain.errors.js";
import { ACCOUNT_ERROR_CODES, SERVICE_TYPES } from "../../domain/account.enum.js";

export class SuspendAccount {
	constructor({ accountRepository, subscriptionRepository, routerProvisioningRepository, networkService, auditService }) {
		this.accountRepository = accountRepository;
		this.subscriptionRepository = subscriptionRepository;
		this.routerProvisioningRepository = routerProvisioningRepository;
		this.networkService = networkService;
		this.auditService = auditService;
	}

	async execute({ actorId, accountId, reason = null, ip = null }) {
		const account = await this.accountRepository.findById(accountId);
		if (!account) throw new NotFoundError("Account not found", ACCOUNT_ERROR_CODES.ACCOUNT_NOT_FOUND);

		const previousStatus = account.status;
		account.suspend();
		const updated = await this.accountRepository.update(account.id, { status: account.status });

		const subscription = await this.subscriptionRepository.findCurrentByAccountId(accountId);
		if (subscription) {
			await this._disconnectEverywhere(account, subscription);
		}

		if (this.auditService) {
			await this.auditService.log({
				actorId, action: "ACCOUNT_SUSPENDED", entity: "Account", entityId: account.id,
				oldValue: { status: previousStatus }, newValue: { status: account.status, reason }, ip
			});
		}

		return updated;
	}

	async _disconnectEverywhere(account, subscription) {
		if (account.serviceType === SERVICE_TYPES.HOTSPOT) {
			const provisionings = await this.routerProvisioningRepository.findByAccount(account.id);
			for (const p of provisionings) {
				await this.networkService.suspend(subscription, { routerId: p.routerId }).catch((err) =>
					console.error(`[SuspendAccount] Router ${p.routerId} suspend failed:`, err.message)
				);
			}
		} else {
			await this.networkService.suspend(subscription).catch((err) =>
				console.error("[SuspendAccount] Network suspension failed:", err.message)
			);
		}
	}
}
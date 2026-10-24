import { NotFoundError, ConflictError } from "../../../../shared/errors/domain.errors.js";
import { ACCOUNT_ERROR_CODES } from "../../domain/account.enum.js";
import { normalizeWsnId } from "../../domain/wsn-id.js";

export class ChangeWsnId {
	constructor({ accountRepository, subscriptionRepository, routerProvisioningRepository, auditService }) {
		this.accountRepository = accountRepository;
		this.subscriptionRepository = subscriptionRepository;
		this.routerProvisioningRepository = routerProvisioningRepository;
		this.auditService = auditService;
	}

	async execute({ actorId, accountId, wsnId, force = false, ip = null }) {
		const account = await this.accountRepository.findById(accountId);
		if (!account) throw new NotFoundError("Account not found", ACCOUNT_ERROR_CODES.ACCOUNT_NOT_FOUND);

		const next = normalizeWsnId(wsnId);
		if (next === account.wsnId) return { account, warning: null };

		if (await this.accountRepository.wsnIdExists(next, { excludeId: account.id })) {
			throw new ConflictError(`WSN ID ${next} is already used by another account`, ACCOUNT_ERROR_CODES.WSN_ID_CONFLICT);
		}

		const onRouter = await this._isOnRouter(account);
		if (onRouter && !force) {
			throw new ConflictError(
				"This account already exists on a router under its current WSN ID. Changing it here would not rename the router user. Ask a superadmin to force the change after the router user has been renamed.",
				"WSN_ID_LOCKED"
			);
		}

		const previous = account.wsnId;
		await this.accountRepository.setWsnId(account.id, next);

		await this.auditService?.log({
			actorId, action: "ACCOUNT_WSN_ID_CHANGED", entity: "Account", entityId: account.id,
			oldValue: { wsnId: previous }, newValue: { wsnId: next, forced: onRouter }, ip
		});

		const updated = await this.accountRepository.findById(account.id);

		return {
			account: updated,
			warning: onRouter ? `The router user "${previous}" was not renamed. Rename it to "${next}" on the MikroTik or provisioning will create a duplicate.` : null
		};
	}

	async _isOnRouter(account) {
		const subscriptions = await this.subscriptionRepository.findByAccountId(account.id);
		if (subscriptions.some((subscription) => subscription.mikrotikStatus === "synced")) return true;

		const provisioned = await this.routerProvisioningRepository.findByAccount(account.id);
		return provisioned.length > 0;
	}
}

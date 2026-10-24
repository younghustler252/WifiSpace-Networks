import crypto from "crypto";
import { NotFoundError } from "../../../../shared/errors/domain.errors.js";
import { ACCOUNT_ERROR_CODES } from "../../domain/account.enum.js";
import { normalizeRouterPassword } from "../../domain/wsn-id.js";

export class SetRouterPassword {
	constructor({ accountRepository, subscriptionRepository, networkService, auditService }) {
		this.accountRepository = accountRepository;
		this.subscriptionRepository = subscriptionRepository;
		this.networkService = networkService;
		this.auditService = auditService;
	}

	async execute({ actorId, accountId, password = null, ip = null }) {
		const account = await this.accountRepository.findById(accountId);
		if (!account) throw new NotFoundError("Account not found", ACCOUNT_ERROR_CODES.ACCOUNT_NOT_FOUND);

		const next = password ? normalizeRouterPassword(password) : crypto.randomBytes(9).toString("base64url");
		await this.accountRepository.setRouterPassword(account.id, next);

		let routerSync = { status: "not_needed" };
		const subscription = await this.subscriptionRepository.findCurrentByAccountId(account.id);

		if (subscription?.isActive()) {
			const queued = await this.networkService.syncPassword(subscription, {});
			routerSync = queued.provisioning ?? { status: queued.success ? "pending" : "failed" };
		}

		await this.auditService?.log({
			actorId, action: "ROUTER_PASSWORD_CHANGED", entity: "Account", entityId: account.id,
			newValue: { generated: !password, routerSync: routerSync.status }, ip
		});

		return { username: account.wsnId, password: next, generated: !password, routerSync };
	}
}

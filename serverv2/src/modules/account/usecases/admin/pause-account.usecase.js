import { NotFoundError } from "../../../../shared/errors/domain.errors.js";
import { ACCOUNT_ERROR_CODES } from "../../domain/account.enum.js";

export class PauseAccount {
	constructor({ accountRepository, networkService, auditService }) {
		this.accountRepository = accountRepository;
		this.networkService = networkService;
		this.auditService = auditService;
	}

	async execute({ actorId, accountId, reason = null, ip = null }) {
		const account = await this.accountRepository.findById(accountId);
		if (!account) throw new NotFoundError("Account not found", ACCOUNT_ERROR_CODES.ACCOUNT_NOT_FOUND);

		const previousStatus = account.status;
		account.pause();

		const updated = await this.accountRepository.update(account.id, { status: account.status });

		await this.networkService?.deactivate({ accountId: account.id }).catch((err) =>
			console.error("[PauseAccount] Network deactivation failed:", err.message)
		);

		if (this.auditService) {
			await this.auditService.log({
				actorId, action: "ACCOUNT_PAUSED", entity: "Account", entityId: account.id,
				oldValue: { status: previousStatus }, newValue: { status: account.status, reason }, ip
			});
		}

		return updated;
	}
}

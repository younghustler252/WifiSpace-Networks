import { NotFoundError } from "../../../../shared/errors/domain.errors.js";
import { ACCOUNT_ERROR_CODES, ACCOUNT_STATUSES } from "../../domain/account.enum.js";

export class DeleteAccount {
	constructor({ accountRepository, auditService }) {
		this.accountRepository = accountRepository;
		this.auditService = auditService;
	}

	async execute({ actorId, accountId, ip = null }) {
		const account = await this.accountRepository.findById(accountId);
		if (!account) throw new NotFoundError("Account not found", ACCOUNT_ERROR_CODES.ACCOUNT_NOT_FOUND);

		const updated = await this.accountRepository.update(account.id, {
			status: ACCOUNT_STATUSES.TERMINATED,
			deletedAt: new Date()
		});

		if (this.auditService) {
			await this.auditService.log({
				actorId, action: "ACCOUNT_DELETED", entity: "Account", entityId: account.id, ip
			});
		}

		return { message: "Account deleted successfully" };
	}
}
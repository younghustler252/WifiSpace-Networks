// account/usecases/admin/link-ipoe-account.usecase.js
import { NotFoundError, ValidationError } from "../../../../shared/errors/domain.errors.js";
import { ACCOUNT_ERROR_CODES } from "../../domain/account.enum.js";

export class LinkIpoeAccount {
	constructor({ accountRepository, auditService }) {
		this.accountRepository = accountRepository;
		this.auditService = auditService;
	}

	async execute({ actorId, accountId, routerId, macAddress, ip = null }) {
		const account = await this.accountRepository.findById(accountId);
		if (!account) throw new NotFoundError("Account not found", ACCOUNT_ERROR_CODES.ACCOUNT_NOT_FOUND);
		if (account.serviceType !== "pppoe" || account.accessMethod !== "ipoe") {
			throw new ValidationError("Account is not an IPoE account");
		}

		const updated = await this.accountRepository.update(accountId, { routerId, macAddress });

		if (this.auditService) {
			await this.auditService.log({ actorId, action: "IPOE_ACCOUNT_LINKED", entity: "Account", entityId: accountId, newValue: { routerId, macAddress }, ip });
		}

		return updated;
	}
}
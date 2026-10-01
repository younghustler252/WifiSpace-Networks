import { NotFoundError, ForbiddenError, ValidationError } from "../../../../shared/errors/domain.errors.js";
import { ACCOUNT_ERROR_CODES, SERVICE_TYPES } from "../../domain/account.enum.js";

export class RemoveDevice {
	constructor({ accountRepository, auditService }) {
		this.accountRepository = accountRepository;
		this.auditService = auditService;
	}

	async execute({ userId, accountId, macAddress, ip = null }) {
		const account = await this.accountRepository.findById(accountId);
		if (!account) throw new NotFoundError("Account not found", ACCOUNT_ERROR_CODES.ACCOUNT_NOT_FOUND);
		if (account.userId !== userId) throw new ForbiddenError("You do not have access to this account", ACCOUNT_ERROR_CODES.ACCOUNT_NOT_OWNED);
		if (account.serviceType !== SERVICE_TYPES.HOTSPOT) throw new ValidationError("Devices can only be removed from hotspot accounts");

		account.removeDevice(macAddress);

		const updated = await this.accountRepository.update(account.id, { devices: account.devices });

		if (this.auditService) {
			await this.auditService.log({
				actorId: userId, action: "DEVICE_REMOVED", entity: "Account", entityId: account.id,
				newValue: { macAddress: macAddress.toUpperCase() }, ip
			});
		}

		return updated;
	}
}

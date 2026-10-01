import { NotFoundError, ValidationError, NotFoundError as UserNotFoundError } from "../../../../shared/errors/domain.errors.js";
import { ACCOUNT_ERROR_CODES } from "../../domain/account.enum.js";
import { USER_ERROR_CODES } from "../../../user/domain/user.enum.js";

export class TransferAccount {
	constructor({ accountRepository, userRepository, auditService }) {
		this.accountRepository = accountRepository;
		this.userRepository = userRepository;
		this.auditService = auditService;
	}

	async execute({ actorId, accountId, newOwnerId, ip = null }) {
		const account = await this.accountRepository.findById(accountId);
		if (!account) throw new NotFoundError("Account not found", ACCOUNT_ERROR_CODES.ACCOUNT_NOT_FOUND);

		if (account.userId === newOwnerId) {
			throw new ValidationError("Account is already owned by this user", ACCOUNT_ERROR_CODES.ACCOUNT_ALREADY_OWNED);
		}

		const newOwner = await this.userRepository.findById(newOwnerId);
		if (!newOwner) throw new UserNotFoundError("New owner not found", USER_ERROR_CODES.USER_NOT_FOUND);

		const previousOwnerId = account.userId;
		account.transferOwnership(newOwnerId);

		const updated = await this.accountRepository.update(account.id, { userId: account.userId });

		if (this.auditService) {
			await this.auditService.log({
				actorId, action: "ACCOUNT_TRANSFERRED", entity: "Account", entityId: account.id,
				oldValue: { userId: previousOwnerId }, newValue: { userId: newOwnerId }, ip
			});
		}

		return updated;
	}
}
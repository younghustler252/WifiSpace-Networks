import crypto from "crypto";
import { PppoeAccount } from "../../domain/pppoe-account.entity.js";
import { HotspotAccount } from "../../domain/hotspot-account.entity.js";
import { SERVICE_TYPES, APPROVAL_STATUSES } from "../../domain/account.enum.js";
import { ValidationError, NotFoundError } from "../../../../shared/errors/domain.errors.js";
import { USER_ERROR_CODES } from "../../../user/domain/user.enum.js";

function generateRouterPassword() {
	return crypto.randomBytes(9).toString("base64url");
}

export class CreateAccount {
	constructor({ accountRepository, userRepository, auditService }) {
		this.accountRepository = accountRepository;
		this.userRepository = userRepository;
		this.auditService = auditService;
	}

	async execute({ actorId, userId, serviceType, accountType, businessName, companyRegistrationNumber, taxId, routerId, routerProfile, maxDevices, ip = null }) {
		const user = await this.userRepository.findById(userId);
		if (!user) throw new NotFoundError("User not found", USER_ERROR_CODES.USER_NOT_FOUND);

		let account;

		if (serviceType === SERVICE_TYPES.PPPOE) {
			if (!routerId) throw new ValidationError("routerId is required for a PPPoE account");

			account = new PppoeAccount({
				userId, accountType, businessName, companyRegistrationNumber, taxId,
				routerId, routerProfile,
				routerPassword: generateRouterPassword(),
				approvalStatus: APPROVAL_STATUSES.APPROVED
			});
		} else if (serviceType === SERVICE_TYPES.HOTSPOT) {
			// business fields are silently ignored here — HotspotAccount forces personal-only, always
			account = new HotspotAccount({ userId, maxDevices, approvalStatus: APPROVAL_STATUSES.APPROVED });
		} else {
			throw new ValidationError("Invalid service type");
		}

		const createdAccount = await this.accountRepository.create(account);

		if (this.auditService) {
			await this.auditService.log({
				actorId, action: "ACCOUNT_CREATED_BY_ADMIN", entity: "Account", entityId: createdAccount.id,
				newValue: { userId, serviceType, accountType }, ip
			});
		}

		return createdAccount;
	}
}
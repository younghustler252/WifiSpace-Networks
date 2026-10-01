import { Account } from "../../domain/account.entity.js";
import { PppoeAccount } from "../../domain/pppoe-account.entity.js";
import { HotspotAccount } from "../../domain/hotspot-account.entity.js";
import { APPROVAL_STATUSES, SERVICE_TYPES } from "../../domain/account.enum.js";
import { ValidationError } from "../../../../shared/errors/domain.errors.js";

export class RequestAccount {
	constructor({ accountRepository, mailService, auditService }) {
		this.accountRepository = accountRepository;
		this.mailService = mailService;
		this.auditService = auditService;
	}

	async execute({ userId, serviceType, accountType, businessName, companyRegistrationNumber, taxId, ip = null }) {
		const base = { userId, accountType, businessName, companyRegistrationNumber, taxId };

		let account;

		if (serviceType === SERVICE_TYPES.PPPOE) {
			account = new PppoeAccount({ ...base, routerId: null, approvalStatus: APPROVAL_STATUSES.PENDING });
			// routerId is required by the schema at approval time, not request time —
			// AccountRepositoryMongo.create() must allow a null routerId for pending PPPoE requests.
		} else if (serviceType === SERVICE_TYPES.HOTSPOT) {
			account = new HotspotAccount({ ...base, approvalStatus: APPROVAL_STATUSES.APPROVED });
		} else {
			throw new ValidationError("Invalid service type");
		}

		const createdAccount = await this.accountRepository.create(account);

		if (this.auditService) {
			await this.auditService.log({
				actorId: userId, action: "ACCOUNT_REQUESTED", entity: "Account", entityId: createdAccount.id,
				newValue: { serviceType, accountType }, ip
			});
		}

		if (createdAccount.serviceType === SERVICE_TYPES.PPPOE && createdAccount.isPendingApproval()) {
			this.mailService?.sendNotification({
				to: process.env.SUPERADMIN_EMAIL,
				name: "Super Admin",
				subject: "New PPPoE Account Approval Request",
				message: `A new PPPoE account request requires approval.\n\nUser ID: ${createdAccount.userId}\nAccount Type: ${createdAccount.accountType}\nStatus: Pending Approval`
			}).catch((err) => console.error("[RequestAccount] Notification email failed:", err.message));
		}

		return createdAccount;
	}
}
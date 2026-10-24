import { APPROVAL_STATUSES, ACCOUNT_ERROR_CODES } from "../../domain/account.enum.js";
import { NotFoundError, ValidationError } from "../../../../shared/errors/domain.errors.js";
import { NOTIFICATION_TYPES } from "../../../notifications/domain/notification.enum.js";

export class ApproveAccount {
	constructor({ accountRepository, createNotification, auditService }) {
		this.accountRepository = accountRepository;
		this.createNotification = createNotification;
		this.auditService = auditService;
	}

	async execute({ actorId, accountId, routerId = null, routerProfile = null, ip = null }) {
		const account = await this.accountRepository.findById(accountId);
		if (!account) throw new NotFoundError("Account not found", ACCOUNT_ERROR_CODES.ACCOUNT_NOT_FOUND);

		if (account.isApproved()) {
			throw new ValidationError("Account already approved", ACCOUNT_ERROR_CODES.ACCOUNT_ALREADY_APPROVED);
		}
		if (![APPROVAL_STATUSES.PENDING, APPROVAL_STATUSES.REJECTED].includes(account.approvalStatus)) {
			throw new ValidationError(`Cannot approve account with status ${account.approvalStatus}`, ACCOUNT_ERROR_CODES.INVALID_APPROVAL_TRANSITION);
		}
		if (account.serviceType === "pppoe" && !account.routerId && !routerId) {
			throw new ValidationError("A routerId must be assigned before approving a PPPoE account");
		}

		if (routerId) account.moveToRouter(routerId);
		if (routerProfile) account.updateRouterProfile(routerProfile);

		// Normal account reads omit encrypted router credentials. Resolve the PPP
		// password only when approval needs it; never expose it in list responses.
		if (account.serviceType === "pppoe" && account.accessMethod === "ppp") {
			const credentials = await this.accountRepository.ensureRouterCredentials(account.id);
			if (!credentials?.routerPassword) {
				throw new ValidationError("Router password could not be resolved for this PPPoE account");
			}
			account.updateRouterPassword(credentials.routerPassword);
		}

		account.approve(actorId);

		const updated = await this.accountRepository.update(account.id, {
			approvalStatus: account.approvalStatus, approvedBy: account.approvedBy, approvedAt: account.approvedAt,
			approvalNote: account.approvalNote, routerId: account.routerId, routerProfile: account.routerProfile
		});

		if (this.auditService) {
			await this.auditService.log({ actorId, action: "ACCOUNT_APPROVED", entity: "Account", entityId: account.id, newValue: { approvalStatus: account.approvalStatus }, ip });
		}

		if (this.createNotification) {
			await this.createNotification.execute({
				actorId, type: NOTIFICATION_TYPES.ACCOUNT_APPROVED,
				title: "Your account is approved!",
				message: "Your installation is ready — subscribe to a plan now to get connected.",
				userIds: [updated.userId], accountId: updated.id, entityType: "Account", entityId: updated.id
			});
		}

		return updated;
	}
}
import { APPROVAL_STATUSES, ACCOUNT_ERROR_CODES, SERVICE_TYPES } from "../../domain/account.enum.js";
import { NotFoundError, ValidationError } from "../../../../shared/errors/domain.errors.js";

export class ApproveAccount {
	constructor({ accountRepository, subscriptionRepository, networkService, auditService }) {
		this.accountRepository = accountRepository;
		this.subscriptionRepository = subscriptionRepository;
		this.networkService = networkService;
		this.auditService = auditService;
	}

	async execute({ actorId, accountId, routerId = null, routerProfile = null, ip = null }) {
		const account = await this.accountRepository.findById(accountId);
		if (!account) throw new NotFoundError("Account not found", ACCOUNT_ERROR_CODES.ACCOUNT_NOT_FOUND);

		if (account.isApproved()) {
			throw new ValidationError("Account already approved", ACCOUNT_ERROR_CODES.ACCOUNT_ALREADY_APPROVED);
		}

		if (![APPROVAL_STATUSES.PENDING, APPROVAL_STATUSES.REJECTED].includes(account.approvalStatus)) {
			throw new ValidationError(
				`Cannot approve account with status ${account.approvalStatus}`,
				ACCOUNT_ERROR_CODES.INVALID_APPROVAL_TRANSITION
			);
		}

		if (account.serviceType === SERVICE_TYPES.PPPOE && !account.routerId && !routerId) {
			throw new ValidationError("A routerId must be assigned before approving a PPPoE account");
		}

		if (routerId) account.moveToRouter(routerId);
		if (routerProfile) account.updateRouterProfile(routerProfile);

		const subscription = await this.subscriptionRepository.findCurrentByAccountId(accountId);
		if (!subscription) {
			throw new ValidationError("No active subscription found for this account", ACCOUNT_ERROR_CODES.NO_ACTIVE_SUBSCRIPTION);
		}

		const result = await this.networkService.activate(subscription, { accountId: account.id });
		if (!result.success) {
			throw new ValidationError(`Failed to provision account: ${result.error}`, ACCOUNT_ERROR_CODES.PROVISIONING_FAILED);
		}

		const previousStatus = account.approvalStatus;
		account.approve(actorId);

		const updated = await this.accountRepository.update(account.id, {
			approvalStatus: account.approvalStatus,
			approvedBy: account.approvedBy,
			approvedAt: account.approvedAt,
			approvalNote: account.approvalNote,
			routerId: account.routerId,
			routerProfile: account.routerProfile
		});

		if (this.auditService) {
			await this.auditService.log({
				actorId, action: "ACCOUNT_APPROVED", entity: "Account", entityId: account.id,
				oldValue: { approvalStatus: previousStatus }, newValue: { approvalStatus: account.approvalStatus }, ip
			});
		}

		return updated;
	}
}
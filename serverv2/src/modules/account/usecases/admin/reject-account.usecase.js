import { APPROVAL_STATUSES, ACCOUNT_ERROR_CODES } from "../../domain/account.enum.js";
import { NotFoundError, ValidationError } from "../../../../shared/errors/domain.errors.js";

export class RejectAccount {
	constructor({ accountRepository, mailService, auditService }) {
		this.accountRepository = accountRepository;
		this.mailService = mailService;
		this.auditService = auditService;
	}

	async execute({ actorId, accountId, note, ip = null }) {
		const account = await this.accountRepository.findById(accountId);
		if (!account) throw new NotFoundError("Account not found", ACCOUNT_ERROR_CODES.ACCOUNT_NOT_FOUND);

		if (account.approvalStatus !== APPROVAL_STATUSES.PENDING) {
			throw new ValidationError(
				`Cannot reject account with status ${account.approvalStatus}`,
				ACCOUNT_ERROR_CODES.INVALID_APPROVAL_TRANSITION
			);
		}

		account.reject(note);

		const updated = await this.accountRepository.update(account.id, {
			approvalStatus: account.approvalStatus,
			approvalNote: account.approvalNote,
			approvedAt: account.approvedAt,
			approvedBy: account.approvedBy
		});

		if (this.auditService) {
			await this.auditService.log({
				actorId, action: "ACCOUNT_REJECTED", entity: "Account", entityId: account.id, newValue: { note }, ip
			});
		}

		if (account.user?.email) {
			this.mailService?.sendNotification({
				to: account.user.email,
				name: account.user.firstName,
				subject: "Your account request was not approved",
				message: note
					? `We reviewed your account request and could not approve it.\n\nReason: ${note}\n\nYou are welcome to submit a new request or contact our support team for help.`
					: "We reviewed your account request and could not approve it.\n\nPlease contact our support team to find out more and to submit a new request."
			}).catch((err) => console.error("[RejectAccount] Notification email failed:", err.message));
		}

		return updated;
	}
}
import { Account } from "../../domain/account.entity.js";
import {
	APPROVAL_STATUSES,
	SERVICE_TYPES
} from "../../domain/account.enum.js";

import { ValidationError } from "../../../../shared/errors/validation-error.js";

export class RequestAccount {

	constructor({
		accountRepository,
		mailService
	}) {
		this.accountRepository = accountRepository;
		this.mailService = mailService;
	}

	async execute(currentUser, data) {
		if (!currentUser?.id) {
			throw new ValidationError(
				"User ID is required"
			);
		}

		const account = new Account({
			...data,
			userId: currentUser.id
		});

		if (
			account.serviceType === SERVICE_TYPES.PPPOE
		) {
			account.approvalStatus =
				APPROVAL_STATUSES.PENDING;
		}

		const createdAccount =
			await this.accountRepository.create(
				account
			);

		if (
			createdAccount.serviceType === SERVICE_TYPES.PPPOE &&
			createdAccount.approvalStatus === APPROVAL_STATUSES.PENDING
		) {
			await this.mailService.sendNotification({
				to: process.env.SUPERADMIN_EMAIL,
				name: "Super Admin",
				subject: "New PPPoE Account Approval Request",
				message: `
A new PPPoE account request requires approval.

User ID:
${createdAccount.userId}

Account Type:
${createdAccount.accountType}

Service:
${createdAccount.serviceType}

Status:
Pending Approval

Please review this request from the admin dashboard.
				`
			});
		}

		return createdAccount;
	}
}
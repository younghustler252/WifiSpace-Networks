import { Account } from "../../domain/account.entity.js";
import { PROFILE_STATUSES } from "../../domain/account.enum.js";

import PERMISSION from "../../../../shared/constants/permissions.js";

import { NotFoundError } from "../../../../shared/errors/not-found-error.js";
import { ValidationError } from "../../../../shared/errors/validation-error.js";

export class SuspendAccount {

	constructor(accountRepository, permissionService, auditService) {
		this.accountRepository = accountRepository;
		this.permissionService = permissionService;
		this.auditService = auditService;
	}

	async execute(currentUser, accountId, context = {}) {

		// ----------------------------
		// Permission Check
		// ----------------------------
		await this.permissionService.hasPermission(
			currentUser.id,
			PERMISSION.ACCOUNT.SUSPEND
		);

		// ----------------------------
		// Fetch Account
		// ----------------------------
		const account = await this.accountRepository.findById(accountId);

		if (!account) {
			throw new NotFoundError("Account not found");
		}

		if (account.profileStatus === PROFILE_STATUSES.SUSPENDED) {
			throw new ValidationError("Account is already suspended");
		}

		// ----------------------------
		// Suspend Account
		// ----------------------------
		account.suspendProfile();

		const updatedAccount = await this.accountRepository.update(account.id, account);

		// ----------------------------
		// Audit Log
		// ----------------------------
		await this.auditService.log({
			actorId: currentUser.id,
			action: "ACCOUNT_SUSPENDED",
			targetId: updatedAccount.id,
			resource: "Account",
			metadata: {
				accountType: updatedAccount.accountType,
				userId: updatedAccount.userId,
				wsnId: updatedAccount.wsnId
			},
			ip: context.ip,
			userAgent: context.userAgent
		});

		return updatedAccount;
	}
}
import { Account } from "../../domain/account.entity.js";
import { PROFILE_STATUSES } from "../../domain/account.enum.js";

import {PERMISSION} from "../../../../shared/constants/permissions.js";

import { NotFoundError } from "../../../../shared/errors/not-found-error.js";
import { ValidationError } from "../../../../shared/errors/validation-error.js";

export class TransferAccount {

	constructor(accountRepository, permissionService, auditService) {
		this.accountRepository = accountRepository;
		this.permissionService = permissionService;
		this.auditService = auditService;
	}

	/**
	 * Transfer ownership of an account to a new user
	 * @param {Object} currentUser - user performing the action
	 * @param {string} accountId - ID of the account to transfer
	 * @param {string} newOwnerId - ID of the new owner
	 * @param {Object} context - { ip, userAgent } for audit logging
	 */
	async execute(currentUser, accountId, newOwnerId, context = {}) {

		// ----------------------------
		// Permission Check
		// ----------------------------
		await this.permissionService.hasPermission(
			currentUser.id,
			PERMISSION.ACCOUNT.TRANSFER
		);

		// ----------------------------
		// Fetch Account
		// ----------------------------
		const account = await this.accountRepository.findById(accountId);

		if (!account) {
			throw new NotFoundError("Account not found");
		}

		if (account.userId === newOwnerId) {
			throw new ValidationError("Account is already owned by this user");
		}

		// ----------------------------
		// Update Ownership
		// ----------------------------
		account.userId = newOwnerId;

		// Optional: mark business accounts pending if critical fields missing
		if (account.isBusinessAccount() && !account.isBusinessComplete()) {
			account.profileStatus = PROFILE_STATUSES.PENDING;
		}

		const updatedAccount = await this.accountRepository.update(account.id, account);

		// ----------------------------
		// Audit Log
		// ----------------------------
		await this.auditService.log({
			actorId: currentUser.id,
			action: "ACCOUNT_TRANSFERRED",
			targetId: updatedAccount.id,
			resource: "Account",
			metadata: {
				oldOwnerId: account.userId,
				newOwnerId: newOwnerId,
				accountType: updatedAccount.accountType,
				wsnId: updatedAccount.wsnId
			},
			ip: context.ip,
			userAgent: context.userAgent
		});

		return updatedAccount;
	}
}
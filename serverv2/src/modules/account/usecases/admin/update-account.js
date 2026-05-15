import { PROFILE_STATUSES } from "../../domain/account.enum.js";
import {PERMISSION} from "../../../../shared/constants/permissions.js";
import { NotFoundError } from "../../../../shared/errors/not-found-error.js";
import { ValidationError } from "../../../../shared/errors/validation-error.js";

export class UpdateAccount {

	constructor(accountRepository, permissionService, auditService) {
		this.accountRepository = accountRepository;
		this.permissionService = permissionService;
		this.auditService = auditService;
	}

	/**
	 * Update a user's own account
	 * @param {Object} currentUser - logged-in user
	 * @param {string} accountId - account to update
	 * @param {Object} updateData - fields allowed to update
	 * @param {Object} context - { ip, userAgent } for audit logging
	 */
	async execute(currentUser, accountId, updateData, context = {}) {

		// ----------------------------
		// Permission Check
		// ----------------------------
		await this.permissionService.hasPermission(
			currentUser.id,
			PERMISSION.ACCOUNT.UPDATE_SELF
		);

		// ----------------------------
		// Fetch Account
		// ----------------------------
		const account = await this.accountRepository.findById(accountId);

		if (!account || account.userId !== currentUser.id) {
			throw new NotFoundError("Account not found or not owned by user");
		}

		// ----------------------------
		// Allowed fields for user updates
		// ----------------------------
		const allowedFields = ["pppoePassword", "routerProfile", "businessName", "taxId", "companyRegistrationNumber"];
		const updates = {};

		for (const key of Object.keys(updateData)) {
			if (allowedFields.includes(key)) {
				updates[key] = updateData[key];
			} else {
				throw new ValidationError(`Cannot update field: ${key}`);
			}
		}

		// ----------------------------
		// Apply updates
		// ----------------------------
		Object.assign(account, updates);

		// If business account and critical fields missing → PENDING
		if (account.isBusinessAccount() && !account.isBusinessComplete()) {
			account.profileStatus = PROFILE_STATUSES.PENDING;
		}

		const updatedAccount = await this.accountRepository.update(account.id, account);

		// ----------------------------
		// Audit log
		// ----------------------------
		await this.auditService.log({
			actorId: currentUser.id,
			action: "ACCOUNT_UPDATED_SELF",
			targetId: updatedAccount.id,
			resource: "Account",
			metadata: {
				accountType: updatedAccount.accountType,
				userId: updatedAccount.userId,
				wsnId: updatedAccount.wsnId,
				updatedFields: Object.keys(updates)
			},
			ip: context.ip,
			userAgent: context.userAgent
		});

		return updatedAccount;
	}
}
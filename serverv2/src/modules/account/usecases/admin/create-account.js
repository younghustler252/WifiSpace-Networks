import { Account } from "../../domain/account.entity.js";
import { PROFILE_STATUSES } from "../../domain/account.enum.js";

import PERMISSION from "../../../../shared/constants/permissions.js";

import { ValidationError } from "../../../../shared/errors/validation-error.js";

export class CreateAccount {

	constructor(
		accountRepository,
		permissionService,
		auditService
	) {
		this.accountRepository = accountRepository;
		this.permissionService = permissionService;
		this.auditService = auditService;
	}

	async execute(currentUser, data, context = {}) {

		// ----------------------------
		// Permission Check
		// ----------------------------

		await this.permissionService.hasPermission(
			currentUser.id,
			PERMISSION.ACCOUNT.CREATE
		);

		// ----------------------------
		// Create Domain Entity
		// ----------------------------

		const account = new Account({
			...data
		});

		// ----------------------------
		// Business Validation
		// ----------------------------

		if (account.needsBusinessVerification()) {
			account.profileStatus = PROFILE_STATUSES.PENDING;
		}

		// ----------------------------
		// Persist Account
		// ----------------------------

		const createdAccount = await this.accountRepository.create(account);

		// ----------------------------
		// Audit Log
		// ----------------------------

		await this.auditService.log({
			actorId: currentUser.id,
			action: "ACCOUNT_CREATED",
			targetId: createdAccount.id,
			resource: "Account",
			metadata: {
				accountType: createdAccount.accountType,
				userId: createdAccount.userId,
				wsnId: createdAccount.wsnId
			},
			ip: context.ip,
			userAgent: context.userAgent
		});

		return createdAccount;
	}
}
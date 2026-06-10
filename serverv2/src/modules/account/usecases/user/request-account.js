import { Account } from "../../domain/account.entity.js";
import { PROFILE_STATUSES } from "../../domain/account.enum.js";

import { ValidationError } from "../../../../shared/errors/validation-error.js";

export class RequestAccount {

	constructor({accountRepository, auditService}) {
		this.accountRepository = accountRepository;
		this.auditService = auditService;
	}

	async execute(currentUser, data, context = {}) {

		// ----------------------------
		// Create Domain Entity
		// ----------------------------

		const account = new Account({
			...data,
			userId: currentUser.id // ensure ownership
		});

		// ----------------------------
		// Business Validation
		// ----------------------------

		if (!account.userId) {
			throw new ValidationError("User ID is required");
		}

		
		// ----------------------------
		// Self-request rule
		// ALWAYS pending
		// ----------------------------

		account.profileStatus = PROFILE_STATUSES.PENDING;

		// ----------------------------
		// Persist Account
		// ----------------------------

		const createdAccount = await this.accountRepository.create(account);

		// ----------------------------
		// Audit Log
		// ----------------------------

		await this.auditService.log({
			actorId: currentUser.id,
			action: "ACCOUNT_SELF_CREATED",
			targetId: createdAccount.id,
			resource: "Account",
			metadata: {
				accountType: createdAccount.accountType,
				userId: createdAccount.userId
			},
			ip: context.ip,
			userAgent: context.userAgent
		});

		return createdAccount;
	}
}
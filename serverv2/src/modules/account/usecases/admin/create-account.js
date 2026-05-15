import { Account } from "../../domain/account.entity.js";
import { PROFILE_STATUSES } from "../../domain/account.enum.js";
import { ANALYTICS_EVENTS } from "../../../analytics/domain/analytics.events.js";

import { ValidationError } from "../../../../shared/errors/validation-error.js";

export class CreateAccount {

	constructor(
		accountRepository,
		permissionService,
		auditService,
		analyticsTracker
	) {
		this.accountRepository = accountRepository;
		this.permissionService = permissionService;
		this.auditService = auditService;
		this.analyticsTracker = analyticsTracker;
	}

	async execute(currentUser, data, context = {}) {

		

		// ----------------------------
		// Create Domain Entity
		// ----------------------------

		const account = new Account({
			...data
		});

		// ----------------------------
		// Business Validation
		// ----------------------------

		// if (account.needsBusinessVerification()) {
		// 	account.profileStatus = PROFILE_STATUSES.PENDING;
		// }

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

		try {
			await this.analyticsTracker.track(
				ANALYTICS_EVENTS.ACCOUNT_CREATED,
				{
					accountType: createdAccount.accountType,
					serviceType: createdAccount.serviceType,
					profileStatus: createdAccount.profileStatus
				}
			);
		} catch (err) {
			console.error("Analytics tracking failed:", {
				event: "ACCOUNT_CREATED",
				error: err.message
			});
		}
		return createdAccount;
	}
}
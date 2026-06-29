import { NotFoundError } from "../../../../shared/errors/not-found-error.js";
import { ValidationError } from "../../../../shared/errors/validation-error.js";

export class UpdateAccount {

	constructor({ accountRepository, permissionService, auditService }) {
		this.accountRepository = accountRepository;
		this.permissionService = permissionService;
		this.auditService = auditService;
	}

	/**
	 * Administrative update of any network account profile
	 */
	async execute(currentUser, accountId, updateData, context = {}) {

		// 2. Fetch target account profile
		const account = await this.accountRepository.findById(accountId);
		if (!account) {
			throw new NotFoundError("Account network profile context not found");
		}

		// 3. ✅ Expanded Allowed Fields Array (Includes all hardware, types, and limits)
		const allowedFields = [
			"accountType",
			"businessName",
			"companyRegistrationNumber",
			"taxId",
			"wsnId",
			"routerPassword",
			"routerId",
			"routerProfile",
			"devices",
			"serviceType",
			"profileStatus",
			"routerProvision",
			"limitUptime",
			"routerPassword" // Inherited from common field options
		];

		const updates = {};
		for (const key of Object.keys(updateData)) {
			if (allowedFields.includes(key)) {
				updates[key] = updateData[key];
			} else {
				throw new ValidationError(`Administrative override rejected for field parameter: ${key}`);
			}
		}

		// 4. Apply schema payload structural changes
		Object.assign(account, updates);
		const updatedAccount = await this.accountRepository.update(account.id, account);

		// 5. ✅ Administrative Action Audit Logging
		await this.auditService.log({
			actorId: currentUser.id,
			action: "ACCOUNT_UPDATED_BY_ADMIN", // Modified track action label
			targetId: updatedAccount.id,
			resource: "Account",
			metadata: {
				accountType: updatedAccount.accountType,
				userId: updatedAccount.userId,
				wsnId: updatedAccount.wsnId,
				updatedFields: Object.keys(updates),
				previousStateSnapshot: updates.profileStatus ? { status: account.profileStatus } : undefined
			},
			ip: context.ip,
			userAgent: context.userAgent
		});

		return updatedAccount;
	}
}

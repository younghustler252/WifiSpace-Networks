import { Account } from "../../domain/account.entity.js";
import { PROFILE_STATUSES } from "../../domain/account.enum.js";
import { ValidationError } from "../../../../shared/errors/validation-error.js";

export class RequestAccount {
	constructor({
		accountRepository,
		auditService,
		mailService
	}) {
		this.accountRepository = accountRepository;
		this.auditService = auditService;
		this.mailService = mailService;
	}

	async execute(currentUser, data, context = {}) {

		const account = new Account({
			...data,
			userId: currentUser.id
		});

		if (!account.userId) {
			throw new ValidationError(
				"User ID is required"
			);
		}

		account.profileStatus =
			account.serviceType === "hotspot"
				? PROFILE_STATUSES.ACTIVE
				: PROFILE_STATUSES.PENDING;


		const createdAccount =
			await this.accountRepository.create(account);


		if (
			createdAccount.serviceType === "pppoe" &&
			createdAccount.profileStatus === PROFILE_STATUSES.PENDING
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


		await this.auditService.log({
			actorId: currentUser.id,
			action: "ACCOUNT_SELF_CREATED",
			targetId: createdAccount.id,
			resource: "Account",
			metadata: {
				accountType: createdAccount.accountType,
				serviceType: createdAccount.serviceType,
				profileStatus: createdAccount.profileStatus,
				userId: createdAccount.userId
			},
			ip: context.ip,
			userAgent: context.userAgent
		});


		return createdAccount;
	}
}
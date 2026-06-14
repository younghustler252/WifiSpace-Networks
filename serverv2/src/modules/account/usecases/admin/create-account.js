import { Account } from "../../domain/account.entity.js";
import { ANALYTICS_EVENTS } from "../../../analytics/domain/analytics.events.js";

export class CreateAccount {
	constructor({
		accountRepository,
		permissionService,
		auditService,
		analyticsTracker,
		createRouterAccount,
	}) {
		this.accountRepository = accountRepository;
		this.permissionService = permissionService;
		this.auditService = auditService;
		this.analyticsTracker = analyticsTracker;
		this.createRouterAccount = createRouterAccount;
	}

	async execute( data, context = {}) {
		// console.log("data", data);
		// console.log("context", context);
		// ----------------------------
		// Create Domain Entity
		// ----------------------------
		const account = new Account({
			...data,
			userId: data.userId
		});

		account.profileStatus = "pending";

		// ----------------------------
		// Persist Account
		// ----------------------------
		const createdAccount =
			await this.accountRepository.create(account);

		let routerResult = null;

		// ----------------------------
		// RESOLVE ROUTER PASSWORD (DEFAULT FALLBACK)
		// ----------------------------
		const routerPassword =
			createdAccount.routerPassword ||
			"access@C0NN3CT@pppoe123$";

		// optional: persist resolved password so DB is consistent
		createdAccount.routerPassword = routerPassword;

		// ----------------------------
		// Provision Router Account
		// ----------------------------
		if (createdAccount.routerId) {
			try {
				routerResult =
					await this.createRouterAccount.execute(
						createdAccount.id,
						{
							...context,
							routerId:
								createdAccount.routerId,
							routerPassword,
						}
					);

				createdAccount.routerProvision.status =
					"synced";

				createdAccount.profileStatus = "active";

			} catch (err) {
				console.error(
					"Router provisioning failed:",
					err.message
				);

				routerResult = {
					success: false,
					message: err.message,
				};

				createdAccount.routerProvision.status =
					"failed";

				createdAccount.routerProvision.lastError =
					err.message;

				createdAccount.profileStatus = "pending";
			}

			createdAccount.routerProvision.lastAttemptAt =
				new Date();

			await this.accountRepository.update(
				createdAccount.id,
				createdAccount
			);
		}

		// ----------------------------
		// Audit Log
		// ----------------------------
		// await this.auditService.log({
		// 	actorId: context.id,
		// 	action: "ACCOUNT_CREATED",
		// 	targetId: createdAccount.id,
		// 	resource: "Account",
		// 	metadata: {
		// 		accountType: createdAccount.accountType,
		// 		userId: createdAccount.userId,
		// 		wsnId: createdAccount.wsnId,
		// 		routerProvision:
		// 			createdAccount.routerProvision.status,
		// 	},
		// 	ip: context.ip,
		// 	userAgent: context.userAgent,
		// });

		// ----------------------------
		// Analytics Tracking
		// ----------------------------
		try {
			await this.analyticsTracker.track(
				ANALYTICS_EVENTS.ACCOUNT_CREATED,
				{
					accountType:
						createdAccount.accountType,
					serviceType:
						createdAccount.serviceType,
					profileStatus:
						createdAccount.profileStatus,
					routerProvisionStatus:
						createdAccount.routerProvision.status,
				}
			);
		} catch (err) {
			console.error(
				"Analytics tracking failed:",
				err.message
			);
		}

		// ----------------------------
		// Return result
		// ----------------------------
		return {
			account: createdAccount,
			routerProvision: routerResult,
		};
	}
}
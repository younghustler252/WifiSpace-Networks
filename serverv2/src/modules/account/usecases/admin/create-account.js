import { Account } from "../../domain/account.entity.js";
import { ANALYTICS_EVENTS } from "../../../analytics/domain/analytics.events.js";

export class CreateAccount {
	constructor({
		accountRepository,
		userRepository,
		permissionService,
		auditService,
		analyticsTracker,
		createRouterAccount,
	}) {
		this.accountRepository = accountRepository;
		this.userRepository = userRepository;
		this.permissionService = permissionService;
		this.auditService = auditService;
		this.analyticsTracker = analyticsTracker;
		this.createRouterAccount = createRouterAccount;
	}

	async execute(data, context = {}) {
		// 1. Create Domain Entity
		const account = new Account({
			...data,
			userId: data.userId
		});
		account.profileStatus = "pending";

		// 2. Persist Initial Account
		const createdAccount = await this.accountRepository.create(account);

		// 3. RESOLVE ROUTER PASSWORD
		let routerPassword = createdAccount.routerPassword;

		if (!routerPassword) {
			try {
				const user = await this.userRepository.findById(createdAccount.userId.toString());
				const userPhone = user?.phone;

				if (createdAccount.serviceType === "hotspot") {
					routerPassword = userPhone || "Access123";
				} else {
					routerPassword = userPhone || "C0NN3CT@pppoe123$";
				}
			} catch (dbErr) {
				console.error("User lookup failed, using fallback password:", dbErr.message);
				routerPassword = createdAccount.serviceType === "hotspot" ? "Access123" : "C0NN3CT@pppoe123$";
			}
		}

		// Sync resolved password to the entity instance
		createdAccount.routerPassword = routerPassword;

		// 4. Provision Router Account (If routerId exists)
		let routerResult = null;

		if (createdAccount.routerId) {
			try {
				routerResult = await this.createRouterAccount.execute(
					createdAccount.id,
					{
						...context,
						routerId: createdAccount.routerId,
						routerPassword,
					}
				);

				createdAccount.routerProvision.status = "synced";
				createdAccount.profileStatus = "active";
			} catch (err) {
				console.error("Router provisioning failed:", err.message);
				routerResult = { success: false, message: err.message };
				createdAccount.routerProvision.status = "failed";
				createdAccount.routerProvision.lastError = err.message;
				createdAccount.profileStatus = "pending";
			}

			createdAccount.routerProvision.lastAttemptAt = new Date();
		}

		// 5. CRITICAL FIX: Always update database to persist the password and provision updates
		await this.accountRepository.update(
			createdAccount.id,
			createdAccount
		);

		// 6. Analytics Tracking
		try {
			await this.analyticsTracker.track(
				ANALYTICS_EVENTS.ACCOUNT_CREATED,
				{
					accountType: createdAccount.accountType,
					serviceType: createdAccount.serviceType,
					profileStatus: createdAccount.profileStatus,
					routerProvisionStatus: createdAccount.routerProvision.status,
				}
			);
		} catch (err) {
			console.error("Analytics tracking failed:", err.message);
		}

		return {
			account: createdAccount,
			routerProvision: routerResult,
		};
	}
}

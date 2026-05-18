// src/application/use-cases/ProvisionNetworkAccount.js
import { ValidationError } from "../../../../shared/errors/validation-error.js";

export class ProvisionNetworkAccount {
	constructor(accountRepository, routerRepository, subscriptionRepository, mikrotikService, auditService) {
		this.accountRepository = accountRepository;
		this.routerRepository = routerRepository;
		this.subscriptionRepository = subscriptionRepository;
		this.mikrotikService = mikrotikService;
		this.auditService = auditService;
	}

	async execute(subscriptionId, context = {}) {
		// -------------------------
		// 1. Fetch subscription
		// -------------------------
		const subscription = await this.subscriptionRepository.findById(subscriptionId);
		if (!subscription) throw new ValidationError("Subscription not found");
		if (subscription.status !== "active") {
			throw new ValidationError("Subscription must be active to provision network account");
		}

		// -------------------------
		// 2. Fetch linked account
		// -------------------------
		const account = await this.accountRepository.findById(subscription.accountId);
		if (!account) throw new ValidationError("Account linked to subscription not found");
		if (account.profileStatus !== "active") {
			throw new ValidationError("Account must be active to provision network hardware");
		}

		// -------------------------
		// 3. Fetch assigned router
		// -------------------------
		if (!account.routerId) throw new ValidationError("Account does not have an assigned router");
		const router = await this.routerRepository.findById(account.routerId);
		if (!router) throw new ValidationError("Assigned hardware router could not be found");
		if (!router.apiEnabled || !router.isEnabled) {
			throw new ValidationError("Target router is currently accepting no provisioning API cycles");
		}

		// -------------------------
		// 4. Assign router profile & limits from subscription
		// -------------------------
		account.routerProfile = subscription.planSnapshot.mikrotikProfile;
		account.limitUptime = `${subscription.planSnapshot.durationValue}${subscription.planSnapshot.durationUnit[0]}`; // e.g., 30d

		try {
			// -------------------------
			// 5. Check if account already exists on router
			// -------------------------
			let userExists = false;
			if (account.mikrotikUserCreated) {
				// Optional: double-check with router in case DB is stale
				userExists = await this.mikrotikService.checkUserExists(account, router);
			}

			if (userExists) {
				// Sync profile if needed
				await this.mikrotikService.updateAccount(account, router);
			} else {
				// Provision account on router
				await this.mikrotikService.createAccount(account, router);
				account.mikrotikUserCreated = true;
			}

			// -------------------------
			// 6. Update account in DB
			// -------------------------
			await this.accountRepository.update(account.id, account);

			// -------------------------
			// 7. Update router session count
			// -------------------------
			await this.routerRepository.incrementSessions(router.id);

			// -------------------------
			// 8. Update subscription state
			// -------------------------
			subscription.mikrotikStatus = "synced";
			subscription.mikrotikLastSyncAt = new Date();
			await this.subscriptionRepository.update(subscription.id, subscription);

			// -------------------------
			// 9. Audit log
			// -------------------------
			await this.auditService.log({
				actorId: context.actorId || "SYSTEM_PROVISIONER",
				action: "MIKROTIK_PROVISIONING_SUCCESS",
				targetId: account.id,
				resource: "Account",
				metadata: {
					subscriptionId: subscription.id,
					routerCode: router.code,
					wsnId: account.wsnId,
					userExists
				}
			});

			return { success: true, message: userExists ? "Account already existed and was synced" : "Subscription provisioned on network successfully" };

		} catch (error) {
			// -------------------------
			// 10. Handle router/network errors
			// -------------------------
			await this.routerRepository.updateStatus(router.id, "online", error.message);
			throw new Error(`Network provisioning interface failure: ${error.message}`);
		}
	}
}
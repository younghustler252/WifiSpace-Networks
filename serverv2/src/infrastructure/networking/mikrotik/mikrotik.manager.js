export class MikrotikManager {
	constructor({
		accountRepository,
		routerRepository,
		routerProvisioningRepository, // NEW — records per-router status instead of Subscription.mikrotikStatus
		hotspotService,
		pppoeService
	}) {
		this.accountRepository = accountRepository;
		this.routerRepository = routerRepository;
		this.routerProvisioningRepository = routerProvisioningRepository;
		this.hotspotService = hotspotService;
		this.pppoeService = pppoeService;
	}

	async provision(subscription, metadata = {}) {
		const { account, router } = await this.loadContext(subscription);

		try {
			const planSnapshot = subscription.planSnapshot || {};
			if (planSnapshot.mikrotikProfile && account.routerProfile !== planSnapshot.mikrotikProfile) {
				account.routerProfile = planSnapshot.mikrotikProfile;
				await this.accountRepository.update(account.id, account);
			}

			const service = this.getService(account);

			const exists = await service.userExists(router, account.wsnId);

			if (!exists) {
				await service.createUser(router, account);
				await this._waitForUser(service, router, account.wsnId);
			} else {
				await service.updateUser(router, account);
				await service.resumeUser(router, account.wsnId);
			}

			const loginResult = await service.login(router, {
				username: account.wsnId,
				password: account.routerPassword,
				ipAddress: metadata.ipAddress
			});

			// NEW: record success for THIS specific router, not a global
			// subscription-level flag. This is what makes roaming actually
			// work — Router 2's own record stays "not_started" until this
			// method runs for Router 2 specifically.
			await this.routerProvisioningRepository.upsertForAccountRouter({
				accountId: account.id,
				subscriptionId: subscription.id,
				routerId: router.id,
				status: "synced"
			});

			return { autoConnected: true, method: "login", data: loginResult };

		} catch (err) {
			await this.routerProvisioningRepository.upsertForAccountRouter({
				accountId: account.id,
				subscriptionId: subscription.id,
				routerId: router.id,
				status: "failed",
				lastError: err.message
			});
			throw err;
		}
	}

	async suspend(subscription) {
		const { account, router } = await this.loadContext(subscription);
		const service = this.getService(account);

		try {
			await service.suspendUser(router, account.wsnId);
			await service.disconnectUser(router, account.wsnId);

			await this.routerProvisioningRepository.upsertForAccountRouter({
				accountId: account.id,
				subscriptionId: subscription.id,
				routerId: router.id,
				status: "not_started" // suspended = no longer live here; a fresh provision() will re-sync when needed
			});

			return { success: true };
		} catch (err) {
			await this.routerProvisioningRepository.upsertForAccountRouter({
				accountId: account.id,
				subscriptionId: subscription.id,
				routerId: router.id,
				status: "failed",
				lastError: err.message
			});
			throw err;
		}
	}

	async resume(subscription, metadata = {}) {
		const { account, router } = await this.loadContext(subscription);
		const service = this.getService(account);

		try {
			await service.resumeUser(router, account.wsnId);

			const loginResult = await service.login(router, {
				username: account.wsnId,
				password: account.routerPassword,
				ipAddress: metadata.ipAddress
			});

			await this.routerProvisioningRepository.upsertForAccountRouter({
				accountId: account.id,
				subscriptionId: subscription.id,
				routerId: router.id,
				status: "synced"
			});

			return { autoConnected: true, method: "login", data: loginResult };
		} catch (err) {
			await this.routerProvisioningRepository.upsertForAccountRouter({
				accountId: account.id,
				subscriptionId: subscription.id,
				routerId: router.id,
				status: "failed",
				lastError: err.message
			});
			throw err;
		}
	}

	async disconnect(subscription) {
		const { account, router } = await this.loadContext(subscription);
		return this.getService(account).disconnectUser(router, account.wsnId);
	}

	async remove(subscription) {
		const { account, router } = await this.loadContext(subscription);
		const service = this.getService(account);

		if (!service.removeUser) {
			return { success: true };
		}

		await service.removeUser(router, account.wsnId);

		await this.routerProvisioningRepository.upsertForAccountRouter({
			accountId: account.id,
			subscriptionId: subscription.id,
			routerId: router.id,
			status: "not_started"
		});

		return { success: true };
	}

	async changePassword(subscription, password) {
		const { account, router } = await this.loadContext(subscription);
		return this.getService(account).changePassword(router, account.wsnId, password);
	}

	async getProfiles(router, serviceType) {
		return this.resolveService(serviceType).getProfiles(router);
	}

	async getActiveSession(router, serviceType, username) {
		return this.resolveService(serviceType).getActiveSession(router, username);
	}

	async getActiveSessions(router, serviceType) {
		return this.resolveService(serviceType).getActiveSessions(router);
	}

	// NEW: provisions this account on a SPECIFIC router, used by the
	// upcoming auto-provision-on-roam logic — same as provision() but takes
	// the router directly instead of resolving it from account.routerId,
	// since the roaming case is exactly "a router that ISN'T the account's
	// primary router."
	async provisionOnRouter(subscription, router, metadata = {}) {
		const account = await this.accountRepository.findById(subscription.accountId);
		if (!account) throw new Error("Account not found");

		const service = this.getService(account);

		try {
			const exists = await service.userExists(router, account.wsnId);

			if (!exists) {
				await service.createUser(router, account);
				await this._waitForUser(service, router, account.wsnId);
			} else {
				await service.updateUser(router, account);
				await service.resumeUser(router, account.wsnId);
			}

			const loginResult = await service.login(router, {
				username: account.wsnId,
				password: account.routerPassword,
				ipAddress: metadata.ipAddress
			});

			await this.routerProvisioningRepository.upsertForAccountRouter({
				accountId: account.id,
				subscriptionId: subscription.id,
				routerId: router.id,
				status: "synced"
			});

			return { autoConnected: true, method: "login", data: loginResult };
		} catch (err) {
			await this.routerProvisioningRepository.upsertForAccountRouter({
				accountId: account.id,
				subscriptionId: subscription.id,
				routerId: router.id,
				status: "failed",
				lastError: err.message
			});
			throw err;
		}
	}

	async loadContext(subscription) {
		const account = await this.accountRepository.findById(subscription.accountId);
		if (!account) throw new Error("Account not found");

		if (!account.routerId) throw new Error("Account has no router assigned");

		const router = await this.routerRepository.findById(account.routerId);
		if (!router) throw new Error("Router not found");

		return { account, router };
	}

	getService(account) {
		return this.resolveService(account.serviceType);
	}

	resolveService(type) {
		switch (type) {
			case "hotspot":
				return this.hotspotService;
			case "pppoe":
				return this.pppoeService;
			default:
				throw new Error(`Unsupported service type: ${type}`);
		}
	}

	async _waitForUser(service, router, username, attempts = 5, delayMs = 400) {
		for (let i = 0; i < attempts; i++) {
			const exists = await service.userExists(router, username);
			if (exists) return true;
			await new Promise((resolve) => setTimeout(resolve, delayMs));
		}
		return false;
	}
}
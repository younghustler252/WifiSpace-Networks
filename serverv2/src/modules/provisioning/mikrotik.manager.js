export class MikrotikManager {
	constructor({ accountRepository, routerRepository, hotspotService, pppoeService, ipoeService, routerProvisioningRepository }) {
		this.accountRepository = accountRepository;
		this.routerRepository = routerRepository;
		this.hotspotService = hotspotService;
		this.pppoeService = pppoeService;
		this.ipoeService = ipoeService;
		this.routerProvisioningRepository = routerProvisioningRepository;
	}

	async provision(subscription, metadata = {}) {
		const { account, router } = await this.loadContext(subscription, metadata);

		if (account.accessMethod === "ipoe") {
			return this._provisionIpoe(account, router, subscription);
		}

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

		// NEW: for hotspot accounts, record which router this account is now
		// live on — supports "which accounts are on Router X" queries later
		// (capacity, downtime notification) without scanning session data.
		if (account.serviceType === "hotspot") {
			await this.routerProvisioningRepository.markSynced({
				accountId: account.id,
				subscriptionId: subscription.id,
				routerId: router.id
			});
		}

		return { autoConnected: true, method: "login", data: loginResult };
	}

	async _provisionIpoe(account, router, subscription) {
		const maxLimit = subscription.planSnapshot?.speedRate || "5M/5M";

		await this.ipoeService.ensureStaticLease(router, {
			macAddress: account.macAddress,
			ipAddress: account.staticIp,
			comment: account.wsnId
		});

		await this.ipoeService.setSpeed(router, {
			wsnId: account.wsnId,
			ipAddress: account.staticIp,
			maxLimit,
			comment: account.wsnId
		});

		await this.ipoeService.resume(router, account.staticIp);

		return { autoConnected: true, method: "ipoe_lease_and_queue" };
	}

	async suspend(subscription, metadata = {}) {
		const { account, router } = await this.loadContext(subscription, metadata);

		if (account.accessMethod === "ipoe") {
			await this.ipoeService.suspend(router, account.staticIp, account.wsnId);
			return { success: true };
		}

		const service = this.getService(account);

		await service.suspendUser(router, account.wsnId);
		await service.disconnectUser(router, account.wsnId);

		return { success: true };
	}

	async resume(subscription, metadata = {}) {
		const { account, router } = await this.loadContext(subscription, metadata);

		if (account.accessMethod === "ipoe") {
			await this.ipoeService.resume(router, account.staticIp);
			return { autoConnected: true, method: "ipoe_lease_and_queue" };
		}

		const service = this.getService(account);

		await service.resumeUser(router, account.wsnId);

		const loginResult = await service.login(router, {
			username: account.wsnId,
			password: account.routerPassword,
			ipAddress: metadata.ipAddress
		});

		return { autoConnected: true, method: "login", data: loginResult };
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

		return service.removeUser(router, account.wsnId);
	}

	async changePassword(subscription, password) {
		const { account, router } = await this.loadContext(subscription);
		return this.getService(account).changePassword(router, account.wsnId, password);
	}

	// CHANGED: was calling getService({ planSnapshot: { serviceType } }) —
	// a fake subscription-shaped object to satisfy the old
	// getService(subscription) signature. Now calls resolveService(type)
	// directly, since getService(account) expects a real account.
	async getProfiles(router, serviceType) {
		return this.resolveService(serviceType).getProfiles(router);
	}

	async getActiveSession(router, serviceType, username) {
		return this.resolveService(serviceType).getActiveSession(router, username);
	}

	async getActiveSessions(router, serviceType) {
		return this.resolveService(serviceType).getActiveSessions(router);
	}

	async loadContext(subscription, metadata = {}) {
		const account = await this.accountRepository.findById(subscription.accountId);
		if (!account) throw new Error("Account not found");

		let router;

		if (account.serviceType === "hotspot") {
			// Hotspot accounts carry no fixed router — the router comes from
			// whichever physical device the customer is currently connecting
			// through, resolved upstream (captive portal redirect) and passed
			// in via metadata.routerId.
			if (!metadata.routerId) throw new Error("Router ID is required in metadata for hotspot provisioning");
			router = await this.routerRepository.findById(metadata.routerId);
		} else {
			if (!account.routerId) throw new Error("Account has no router assigned");
			router = await this.routerRepository.findById(account.routerId);
		}

		if (!router) throw new Error("Router not found");
		return { account, router };
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

	getService(account) {
		return this.resolveService(account.serviceType);
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

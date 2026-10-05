export class MikrotikManager {
	constructor({ accountRepository, routerRepository, hotspotService, pppoeService, routerProvisioningRepository }) {
		this.accountRepository = accountRepository;
		this.routerRepository = routerRepository;
		this.hotspotService = hotspotService;
		this.pppoeService = pppoeService;
		this.routerProvisioningRepository = routerProvisioningRepository;
	}

	async provision(subscription, metadata = {}) {
		const { account, router } = await this.loadContext(subscription, metadata);

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

		if (account.accessMethod === "ipoe" && account.macAddress) {
			await service.setUserMac(router, {
				username: account.wsnId,
				macAddress: account.macAddress
			});

			await service.bindMac(router, {
				username: account.wsnId,
				macAddress: account.macAddress
			});

			return { autoConnected: true, method: "mac_bypass" };
		}

		if (account.serviceType === "hotspot") {
			const loginResult = await service.login(router, {
				username: account.wsnId,
				password: account.routerPassword,
				ipAddress: metadata.ipAddress
			});

			await this.routerProvisioningRepository.markSynced({
				accountId: account.id,
				subscriptionId: subscription.id,
				routerId: router.id
			});

			return { autoConnected: true, method: "login", data: loginResult };
		}

		return { autoConnected: true, method: "ppp_secret" };
	}

	async suspend(subscription, metadata = {}) {
		const { account, router } = await this.loadContext(subscription, metadata);
		const service = this.getService(account);

		await service.suspendUser(router, account.wsnId);
		await service.disconnectUser(router, account.wsnId);

		return { success: true };
	}

	async resume(subscription, metadata = {}) {
		const { account, router } = await this.loadContext(subscription, metadata);
		const service = this.getService(account);

		await service.resumeUser(router, account.wsnId);

		if (account.accessMethod === "ipoe" && account.macAddress) {
			await service.setUserMac(router, {
				username: account.wsnId,
				macAddress: account.macAddress
			});

			await service.bindMac(router, {
				username: account.wsnId,
				macAddress: account.macAddress
			});

			return { autoConnected: true, method: "mac_bypass" };
		}

		if (account.serviceType === "hotspot") {
			const loginResult = await service.login(router, {
				username: account.wsnId,
				password: account.routerPassword,
				ipAddress: metadata.ipAddress
			});

			return { autoConnected: true, method: "login", data: loginResult };
		}

		return { autoConnected: true, method: "ppp_secret" };
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
		if (account.serviceType === "hotspot") return this.hotspotService;
		if (account.serviceType === "pppoe" && account.accessMethod === "ipoe") return this.hotspotService;
		return this.pppoeService;
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

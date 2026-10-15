export class MikrotikManager {
	constructor({ accountRepository, routerRepository, hotspotService, pppoeService, routerProvisioningRepository }) {
		this.accountRepository = accountRepository;
		this.routerRepository = routerRepository;
		this.hotspotService = hotspotService;
		this.pppoeService = pppoeService;
		this.routerProvisioningRepository = routerProvisioningRepository;
	}

	async provision(subscription, metadata = {}) {
		const { account, router } = await this.loadContext(subscription, metadata, { withPassword: true });

		const planSnapshot = subscription.planSnapshot || {};
		if (planSnapshot.mikrotikProfile && account.routerProfile !== planSnapshot.mikrotikProfile) {
			account.routerProfile = planSnapshot.mikrotikProfile;
			await this.accountRepository.update(account.id, {
				routerProfile: planSnapshot.mikrotikProfile
			});
		}

		const service = this.getService(account);
		const exists = await service.userExists(router, account.wsnId);

		if (!exists) {
			await service.createUser(router, account);
			await this._waitForUser(service, router, account.wsnId);
		} else {
			await service.updateUser(router, account);
			if (account.serviceType === "hotspot") {
				await service.changePassword(router, account.wsnId, account.routerPassword);
			}
			await service.resumeUser(router, account.wsnId);
		}

		if (account.accessMethod === "ipoe") {
			if (!account.macAddress) throw new Error(`IPoE account ${account.id} has no MAC address`);

			await service.setUserMac(router, { username: account.wsnId, macAddress: account.macAddress });
			await service.bindMac(router, { username: account.wsnId, macAddress: account.macAddress });

			return { autoConnected: true, method: "mac_bypass" };
		}

		if (account.serviceType === "hotspot") {
			for (const mac of metadata.evictMacs ?? []) {
				await service.disconnectMac(router, mac);
			}

			await this.routerProvisioningRepository.markSynced({
				accountId: account.id,
				subscriptionId: subscription.id,
				routerId: router.id
			});

			if (!metadata.ipAddress) {
				return { autoConnected: false, method: "login_pending" };
			}

			const loginResult = await service.login(router, {
				username: account.wsnId,
				password: account.routerPassword,
				ipAddress: metadata.ipAddress
			});

			return { autoConnected: true, method: "login", data: loginResult };
		}

		return { autoConnected: true, method: "ppp_secret" };
	}
	
	async suspend(subscription, metadata = {}) {
		const { account, router } = await this.loadContext(subscription, metadata);
		const service = this.getService(account);

		if (!(await service.userExists(router, account.wsnId))) {
			return { success: true, skipped: "user_not_on_router" };
		}

		await service.suspendUser(router, account.wsnId);
		await service.disconnectUser(router, account.wsnId);

		return { success: true };
	}

	async disconnect(subscription, metadata = {}) {
		const { account, router } = await this.loadContext(subscription, metadata);
		return this.getService(account).disconnectUser(router, account.wsnId);
	}

	async remove(subscription, metadata = {}) {
		const { account, router } = await this.loadContext(subscription, metadata);
		const service = this.getService(account);

		if (!service.removeUser) {
			return { success: true };
		}

		return service.removeUser(router, account.wsnId);
	}

	async changePassword(subscription, password, metadata = {}) {
		const { account, router } = await this.loadContext(subscription, metadata);
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

	async loadContext(subscription, metadata = {}, { withPassword = false } = {}) {
		const account = await this.accountRepository.findById(subscription.accountId);
		if (!account) throw new Error("Account not found");

		const routerId = metadata.routerId || account.routerId;
		if (!routerId) {
			throw new Error(account.serviceType === "hotspot" ? "Router ID is required for hotspot provisioning" : "Account has no router assigned");
		}

		const router = await this.routerRepository.findById(routerId);
		if (!router) throw new Error("Router not found");

		if (withPassword && !account.routerPassword) {
			const credentials = await this.accountRepository.ensureRouterCredentials(account.id);
			account.routerPassword = credentials?.routerPassword ?? null;
			if (!account.routerPassword) throw new Error(`Missing router password for account ${account.id}`);
		}

		return { account, router };
	}

	async resume(subscription, metadata = {}) {
		const { account, router } = await this.loadContext(subscription, metadata, { withPassword: Boolean(metadata.ipAddress) });
		const service = this.getService(account);

		await service.resumeUser(router, account.wsnId);

		if (account.serviceType === "hotspot" && metadata.ipAddress) {
			const loginResult = await service.login(router, {
				username: account.wsnId,
				password: account.routerPassword,
				ipAddress: metadata.ipAddress
			});

			return { autoConnected: true, method: "login", data: loginResult };
		}

		return { autoConnected: false, method: "resume_user" };
	}

	async disconnectDevice(subscription, metadata = {}) {
		const { router } = await this.loadContext(subscription, metadata);
		return this.hotspotService.disconnectMac(router, metadata.macAddress);
	}

	resolveService(type) {
		switch (type) {
			case "hotspot":
				return this.hotspotService;
			case "pppoe":
				return this.pppoeService;
			default:
				throw new Error("Unsupported service type: " + type);
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
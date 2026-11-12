const MAC_PATTERN = /^([0-9A-F]{2}:){5}[0-9A-F]{2}$/;

function normalizeMac(value) {
	if (!value) return null;
	const mac = String(value).trim().toUpperCase().replace(/-/g, ":");
	return MAC_PATTERN.test(mac) ? mac : null;
}

function cleanComment(value) {
	return String(value ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, 120);
}

export class MikrotikManager {
	constructor({ accountRepository, routerRepository, hotspotService, pppoeService, routerProvisioningRepository, userRepository }) {
		this.userRepository = userRepository;
		this.accountRepository = accountRepository;
		this.routerRepository = routerRepository;
		this.hotspotService = hotspotService;
		this.pppoeService = pppoeService;
		this.routerProvisioningRepository = routerProvisioningRepository;
	}

	async provision(subscription, metadata = {}) {
		const context = await this.loadContext(subscription, metadata, { withPassword: true });
		const { account } = context;
		let { router } = context;

		const planSnapshot = subscription.planSnapshot || {};
		const profile = this._profileFor(account, planSnapshot);

		if (profile && account.routerProfile !== profile) {
			account.routerProfile = profile;
			await this.accountRepository.update(account.id, { routerProfile: profile });
		}

		const service = this.getService(account);
		let exists = await service.userExists(router, account.wsnId);

		if (!exists && account.accessMethod === "ipoe") {
			const found = await this._locateIpoeUser(account, [router.id, metadata.fromRouterId]);
			if (found) {
				router = found.router;
				exists = true;
				const changes = { routerId: found.router.id };
				if (!account.macAddress && found.macAddress) changes.macAddress = found.macAddress;
				await this.accountRepository.update(account.id, changes);
				Object.assign(account, changes);
			}
		}

		if (exists && account.accessMethod === "ipoe" && !account.macAddress) {
			const existing = await service.getUser(router, account.wsnId);
			const mac = normalizeMac(existing?.["mac-address"]);
			if (mac) {
				await this.accountRepository.update(account.id, { macAddress: mac });
				account.macAddress = mac;
			}
		}

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
			await service.bindMac(router, { username: account.wsnId, macAddress: account.macAddress, account });

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

	async _commentFor(account) {
		try {
			const user = await this.userRepository.findById(account.userId);
			return cleanComment([user?.firstName, user?.lastName].filter(Boolean).join(" "));
		} catch {
			return "";
		}
	}

	async _locateIpoeUser(account, excludeRouterIds = []) {
		const excluded = new Set(excludeRouterIds.filter(Boolean).map(String));
		const available = await this.routerRepository.findAvailableRouters();

		for (const candidate of available) {
			if (excluded.has(String(candidate.id))) continue;

			const router = await this.routerRepository.findById(candidate.id);
			if (!router || router.credentialsMissing) continue;

			try {
				const user = await this.hotspotService.getUser(router, account.wsnId);
				if (user) return { router, macAddress: normalizeMac(user["mac-address"]) };
			} catch (error) {
				console.error(`[MikrotikManager] Could not search ${router.code} for ${account.wsnId}: ${error.message}`);
			}
		}

		return null;
	}

	async moveRouter(subscription, metadata = {}) {
		const fromRouterId = metadata.fromRouterId;
		if (!fromRouterId) throw new Error("fromRouterId is required");

		const account = await this.accountRepository.findById(subscription.accountId);
		if (!account) throw new Error("Account not found");

		let result = { success: true };
		if (metadata.provisionNew) result = await this.provision(subscription, metadata);

		const current = await this.accountRepository.findById(subscription.accountId);
		if (String(current.routerId) === String(fromRouterId)) return result;

		try {
			const oldRouter = await this.routerRepository.findById(fromRouterId);
			if (!oldRouter) return { ...result, removedFromOld: false, removalError: "old_router_not_found" };

			const service = this.getService(account);

			if (await service.userExists(oldRouter, account.wsnId)) {
				if (account.accessMethod === "ipoe") {
					const mac = metadata.previousMacAddress ?? account.macAddress;
					if (mac && service.removeMacBinding) await service.removeMacBinding(oldRouter, mac);
				} else {
					await service.disconnectUser(oldRouter, account.wsnId).catch(() => {});
				}
				await service.removeUser(oldRouter, account.wsnId);
			}

			return { ...result, removedFromOld: true };
		} catch (error) {
			console.error(`[MikrotikManager] Could not clean ${account.wsnId} from the old router: ${error.message}`);
			return { ...result, removedFromOld: false, removalError: error.message };
		}
	}

	async switchAccessMethod(subscription, metadata = {}) {
		const { account, router } = await this.loadContext(subscription, metadata);
		const fromAccessMethod = metadata.fromAccessMethod;
		if (!fromAccessMethod) throw new Error("fromAccessMethod is required");

		const previousService = this.getService({ ...account, accessMethod: fromAccessMethod });

		if (await previousService.userExists(router, account.wsnId)) {
			if (fromAccessMethod === "ipoe") {
				const mac = metadata.previousMacAddress ?? account.macAddress;
				if (mac && previousService.removeMacBinding) await previousService.removeMacBinding(router, mac);
			}
			if (fromAccessMethod === "ppp") await previousService.disconnectUser(router, account.wsnId).catch(() => {});
			await previousService.removeUser(router, account.wsnId);
		}

		if (!metadata.provisionNew) return { success: true, removedOnly: true };

		return this.provision(subscription, metadata);
	}

	async changePassword(subscription, password, metadata = {}) {
		const { account, router } = await this.loadContext(subscription, metadata);
		return this.getService(account).changePassword(router, account.wsnId, password);
	}

	async syncPassword(subscription, metadata = {}) {
		const { account, router } = await this.loadContext(subscription, metadata, { withPassword: true });
		const service = this.getService(account);

		if (!(await service.userExists(router, account.wsnId))) {
			return { success: true, skipped: "user_not_on_router" };
		}

		await service.changePassword(router, account.wsnId, account.routerPassword);
		return { success: true };
	}

	async getProfiles(router, serviceType, accessMethod = null) {
		const profileType = serviceType === "pppoe" && accessMethod === "ipoe" ? "hotspot" : serviceType;
		return this.resolveService(profileType).getProfiles(router);
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

		account.routerComment = await this._commentFor(account);

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

	_profileFor(account, planSnapshot) {
		if (account.serviceType === "pppoe" && account.accessMethod === "ipoe") {
			if (!planSnapshot.ipoeProfile) {
				throw new Error(`Plan "${planSnapshot.name}" has no IPoE profile set`);
			}
			return planSnapshot.ipoeProfile;
		}

		return planSnapshot.mikrotikProfile;
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
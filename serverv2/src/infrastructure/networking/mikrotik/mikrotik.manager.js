export class MikrotikManager {
	constructor({
		accountRepository,
		routerRepository,
		hotspotService,
		pppoeService
	}) {
		this.accountRepository = accountRepository;
		this.routerRepository = routerRepository;
		this.hotspotService = hotspotService;
		this.pppoeService = pppoeService;
	}

	// CHANGED: was `async provision({ subscription, metadata = {} })` — an
	// object-destructured single argument. NetworkService.activate() calls
	// this with TWO positional arguments (subscription, metadata), which
	// silently made `subscription` undefined inside this function — the
	// actual root cause of "Cannot read properties of undefined (reading
	// 'accountId')". Every method below now takes plain positional args,
	// consistently.
	async provision(subscription, metadata = {}) {
		const { account, router } = await this.loadContext(subscription);
		const service = this.getService(account); // CHANGED: was getService(subscription)

		const exists = await service.userExists(router, account.wsnId);

		if (!exists) {
			await service.createUser(router, account);
		} else {
			await service.updateUser(router, account);
			await service.resumeUser(router, account.wsnId);
		}

		
		const loginResult = await service.login(router, {
			username: account.wsnId,
			password: account.routerPassword,
			ipAddress: metadata.ipAddress
		});

		return { autoConnected: true, method: "login", data: loginResult };
	}

	async suspend(subscription) {
		const { account, router } = await this.loadContext(subscription);
		const service = this.getService(account);

		await service.suspendUser(router, account.wsnId);
		await service.disconnectUser(router, account.wsnId);

		return { success: true };
	}

	async resume(subscription, metadata = {}) { // CHANGED: added metadata param
		const { account, router } = await this.loadContext(subscription);
		const service = this.getService(account);

		await service.resumeUser(router, account.wsnId);

		// CHANGED: same fix as provision() above.
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

	async loadContext(subscription) {
		const account = await this.accountRepository.findById(subscription.accountId);
		if (!account) throw new Error("Account not found");

		if (!account.routerId) throw new Error("Account has no router assigned");

		const router = await this.routerRepository.findById(account.routerId);
		if (!router) throw new Error("Router not found");

		return { account, router };
	}

	// CHANGED: was getService(subscription), reading
	// subscription.planSnapshot?.serviceType. Reads account.serviceType now —
	// the account is already loaded by loadContext() before this is called,
	// and it's the more durable source: it exists before any subscription
	// does, and CreateSubscriptionUseCase validates a purchased plan's
	// serviceType matches it, so the two can't drift apart silently. See
	// earlier discussion in this conversation for the full reasoning.
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
}
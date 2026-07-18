export class ActivateHotspotAccess {
	constructor({
		accountRepository,
		routerRepository,
		mikrotikService
	}) {
		this.accountRepository = accountRepository;
		this.routerRepository = routerRepository;
		this.mikrotikService = mikrotikService;
	}

	async execute({
		accountId,
		routerId,
		macAddress,
		hostname,
		ipAddress,
		routerProfile,
		limitUptime
	}) {
		if (!accountId) throw new Error("Account ID required");
		if (!macAddress) throw new Error("MAC address required");

		const account = await this.accountRepository.findById(accountId);
		if (!account) throw new Error("Account not found");

		const router = routerId
			? await this.routerRepository.findById(routerId)
			: await this.routerRepository.findById(account.routerId);
		if (!router) throw new Error("Router not found");

		// 1. Update internal database records first
		const devices = account.devices || [];
		const existing = devices.find(d => d.macAddress === macAddress);

		if (existing) {
			existing.lastSeenAt = new Date();
			existing.ipAddress = ipAddress;
		} else {
			devices.push({
				macAddress,
				hostname,
				ipAddress,
				lastSeenAt: new Date()
			});
		}

		account.devices = devices;
		account.routerProfile = routerProfile; 
		account.limitUptime = limitUptime;     
		account.profileStatus = "active";

		await this.accountRepository.update(account.id, account);

		// 2. Synchronize Router Database State
		try {
			const userExists = await this.mikrotikService.checkUserExists(account, router);
			
			if (userExists) {
				console.log(`[STOPPED ACCOUNT FIX] Wiping user ${account.wsnId} to clear old used uptime metrics.`);
				try {
					await this.mikrotikService.deleteAccount(account, router);
				} catch (deleteErr) {
					console.warn("Could not delete user from MikroTik, attempting to continue:", deleteErr.message);
				}
			}

			// Safe Creation: Catch structural "already exists" errors gracefully to prevent crashes
			try {
				await this.mikrotikService.createAccount(account, router);
			} catch (createErr) {
				if (createErr.message.toLowerCase().includes("already exist")) {
					console.warn(`[IDEMPOTENCY] User ${account.wsnId} was already created by a concurrent request.`);
				} else {
					throw createErr;
				}
			}

			// If it was a renewal/re-creation, terminate any active stray router sessions
			if (userExists) {
				try {
					console.log(`[RENEWAL] Dropping active session for ${account.wsnId} to apply updates.`);
					await this.mikrotikService.disconnectAccount(account, router);
				} catch (sessionErr) {
					console.warn("Could not clear active session (user likely already offline):", sessionErr.message);
				}
			}

		} catch (routerDbError) {
			throw new Error(`Failed to establish user credentials on router database table: ${routerDbError.message}`);
		}

		// 3. Provision Actual Live Network Access
		try {
			const provisionResult = await this.mikrotikService.provisionAccess(
				account,
				router,
				{
					username: account.wsnId,
					password: account.routerPassword,
					macAddress,
					ipAddress
				}
			);

			return {
				success: true,
				autoConnected: provisionResult?.autoConnected ?? false,
				method: provisionResult?.method || "unknown",
				data: provisionResult
			};
			
		} catch (err) {
			// If provision fails because it tries to remake the user, check if we can bypass safely
			if (err.message.toLowerCase().includes("already exist")) {
				return { success: true, autoConnected: true, method: "bypass_fallback" };
			}
			throw new Error("Hotspot session activation failed: " + err.message);
		}
	}
}

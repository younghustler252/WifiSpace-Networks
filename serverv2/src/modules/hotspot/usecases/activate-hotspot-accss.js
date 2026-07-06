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
		account.routerProfile = routerProfile; // Storing the plan profile string name
		account.limitUptime = limitUptime;     // Storing the numeric total seconds calculation
		account.profileStatus = "active";

		await this.accountRepository.update(account.id, account);

		try {
			const userExists = await this.mikrotikService.checkUserExists(account, router);
			if (userExists) {
				
				// 🚀 FIX FOR STOPPED ACCOUNTS: Delete the old user from MikroTik to reset used uptime counters back to 0!
				console.log(`[STOPPED ACCOUNT FIX] Wiping user ${account.wsnId} to clear old used uptime metrics.`);
				try {
					await this.mikrotikService.deleteAccount(account, router);
				} catch (deleteErr) {
					console.warn("Could not delete user from MikroTik, attempting to continue:", deleteErr.message);
				}

				// Re-create the user from scratch so MikroTik tracks the fresh limitUptime accurately
				await this.mikrotikService.createAccount(account, router);
				
				// Kick any old active session hanging on the router
				try {
					console.log(`[RENEWAL] Dropping active session for ${account.wsnId} to apply updates.`);
					await this.mikrotikService.disconnectAccount(account, router);
				} catch (sessionErr) {
					console.warn("Could not clear active session (user likely already offline):", sessionErr.message);
				}
				
			} else {
				await this.mikrotikService.createAccount(account, router);
			}
		} catch (dbError) {
			throw new Error(`Failed to establish user credentials on router database table: ${dbError.message}`);
		}

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
			throw new Error("Hotspot session activation failed: " + err.message);
		}

	}
}

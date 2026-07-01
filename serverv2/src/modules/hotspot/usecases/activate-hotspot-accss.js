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
				await this.mikrotikService.changePassword(account, router, account.routerPassword);
				await this.mikrotikService.updateAccount(account, router);
				
				// 🚀 FIX: Kick the user session so MikroTik forces them to pick up the new plan profile and limitUptime!
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


				// Locate the second try block at the bottom of your file and update it:
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

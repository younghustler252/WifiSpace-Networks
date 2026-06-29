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
		ipAddress
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

		await this.accountRepository.update(account.id, {
			...account,
			devices
		});

		// try {
		// 	const userExists = await this.mikrotikService.checkUserExists(account, router);
		// 	if (userExists) {
		// 		await this.mikrotikService.updateAccount(account, router);
		// 	} else {
		// 		await this.mikrotikService.createAccount(account, router);
		// 	}
		// } catch (dbError) {
		// 	throw new Error(`Failed to establish user credentials on router database table: ${dbError.message}`);
		// }

		try {
			return await this.mikrotikService.provisionAccess(
				account,
				router,
				{
					username: account.wsnId,
					password: account.routerPassword,
					macAddress,
					ipAddress
				}
			);
		} catch (err) {
			throw new Error("Hotspot session activation failed: " + err.message);
		}
	}
}

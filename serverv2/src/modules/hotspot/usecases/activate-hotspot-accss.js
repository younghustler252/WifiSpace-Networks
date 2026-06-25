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

		if (!accountId) {
			throw new Error("Account ID required");
		}

		if (!macAddress) {
			throw new Error("MAC address required");
		}

		// =====================================================
		// 1. LOAD ACCOUNT
		// =====================================================
		const account =
			await this.accountRepository.findById(accountId);

		if (!account) {
			throw new Error("Account not found");
		}

		// =====================================================
		// 2. LOAD ROUTER (explicit or fallback)
		// =====================================================
		const router =
			routerId
				? await this.routerRepository.findById(routerId)
				: await this.routerRepository.findById(account.routerId);

		if (!router) {
			throw new Error("Router not found");
		}

		// =====================================================
		// 3. DEVICE TRACKING (move logic into repository ideally)
		// =====================================================
		const devices = account.devices || [];

		const existing = devices.find(
			d => d.macAddress === macAddress
		);

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

		// =====================================================
		// 4. PROVISION ACCESS (MICROTIK)
		// =====================================================
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

			throw new Error(
				"Hotspot activation failed: " + err.message
			);
		}
	}
}
export class ActivatePppoeAccess {

	constructor({
		accountRepository,
		routerRepository,
		mikrotikService
	}) {
		this.accountRepository = accountRepository;
		this.routerRepository  = routerRepository;
		this.mikrotikService   = mikrotikService;
	}

	async execute({
		accountId,
		username,
		password
	}) {

		if (!accountId) {
			throw new Error("Account ID required");
		}

		if (!username || !password) {
			throw new Error("PPPoE username and password required");
		}

		const account = await this.accountRepository.findById(accountId);

		if (!account) {
			throw new Error("Account not found");
		}

		const router = await this.routerRepository.findById(account.routerId);

		if (!router) {
			throw new Error("Router not found");
		}

		// ---------------------------------------
		// STORE PPPoE CREDENTIALS ON ACCOUNT
		// ---------------------------------------
		account.pppoe = account.pppoe || {};
		account.pppoe.username = username;
		account.pppoe.password = password;
		account.pppoe.lastSyncedAt = new Date();

		await this.accountRepository.update(account.id, account);

		// ---------------------------------------
		// MIKROTIK PROVISION
		// ---------------------------------------
		try {

			const result = await this.mikrotikService.provisionPppoeAccess(
				account,
				router,
				{
					username,
					password
				}
			);

			return result;

		} catch (err) {

			throw new Error(
				"PPPoE activation failed: " + err.message
			);
		}
	}
}
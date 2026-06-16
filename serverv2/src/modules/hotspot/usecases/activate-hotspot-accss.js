export class ActivateHotspotAccess {

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
        macAddress,
        hostname,
        ipAddress
    }) {

        const account = await this.accountRepository.findById(accountId);

        console.log("hotspsot acct", account)
        if (!account) {
            throw new Error("Account not found");
        }

        const router = await this.routerRepository.findById(account.routerId);

        if (!router) {
            throw new Error("Router not found");
        }

        // Save/update device record
        const existing = account.devices.find(d => d.macAddress === macAddress);

        if (!existing) {
            account.devices.push({
                macAddress,
                hostname,
                lastSeenAt: new Date()
            });
        } else {
            existing.lastSeenAt = new Date();
        }

        await this.accountRepository.update(account.id, account);

        try {
           const result = await this.mikrotikService.provisionAccess(
                account,
                router,
                {
                    username: account.wsnId,
                    password: account.routerPassword,
                    macAddress,
                    ipAddress
                }
            );

            return result;       // ← return the full result so autoConnected flows back up

        } catch (err) {
            throw new Error("Hotspot authorization failed: " + err.message);
        }
    }
}
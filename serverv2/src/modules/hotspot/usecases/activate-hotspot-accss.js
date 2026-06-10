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
        macAddress,
        hostname,
        ipAddress      // ← add this
    }) {

        const account = await this.accountRepository.findById(accountId);
        // console.log("acount", account)
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
        console.log("ipadress in activate hotspot b4 provision", ipAddress);
        

        try {
           await this.mikrotikService.provisionAccess(
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
            throw new Error("Hotspot authorization failed: " + err.message);
        }

        return { success: true };
    }
}
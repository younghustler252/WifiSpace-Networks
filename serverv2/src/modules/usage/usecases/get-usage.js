export class GetUsageUseCase {
    constructor({ usageRepository, accountRepository, routerRepository, syncUsage }) {
        this.usageRepository = usageRepository;
        this.accountRepository = accountRepository;
        this.routerRepository = routerRepository;
        this.syncUsageUseCase = syncUsage;
    }

    async execute(accountId) {
        if (!accountId) {
            throw new Error("accountId is required");
        }

        try {
            // 1. Find the account to see what router it belongs to
            const account = await this.accountRepository.findById(accountId);
            if (account && account.routerId) {
                const router = await this.routerRepository.findById(account.routerId);
                if (router) {
                    // 2. Trigger real-time single sync right before fetching from DB
                    await this.syncUsageUseCase.execute(router, "pppoe", accountId);
                }
            }
        } catch (syncError) {
            // Log sync failure but do not crash the request—fallback to cached DB data
            console.error("Real-time usage sync failed, serving database fallback:", syncError);
        }

        // 3. Fetch the absolute freshest snapshot from DB
        const snapshot = await this.usageRepository.findByAccountId(accountId);
        if (!snapshot) return null;

        return {
            accountId: snapshot.accountId,
            routerId: snapshot.routerId,
            wsnId: snapshot.wsnId,
            online: snapshot.online,
            ipAddress: snapshot.ipAddress,
            macAddress: snapshot.macAddress,
            uptime: snapshot.uptime,
            downloadBytes: snapshot.downloadBytes || snapshot.rxBytes,
            uploadBytes: snapshot.uploadBytes || snapshot.txBytes,
            lastSeenAt: snapshot.lastSeenAt
        };
    }
}

import { UsageSnapshot } from "../domain/usage.entity.js";

export class SyncUsageUseCase {
    constructor({
        mikrotikService,
        accountRepository,
        usageRepository
    }) {
        this.mikrotikService = mikrotikService;
        this.accountRepository = accountRepository;
        this.usageRepository = usageRepository;
    }

    async execute(router, serviceType = "pppoe") {
        // 1. Get all active sessions
        const sessions = await this.mikrotikService.getActiveSessions(
            router,
            serviceType
        );

        if (!Array.isArray(sessions)) return;

        // 2. Get all accounts for mapping
        const accounts = await this.accountRepository.findByRouterId(
            router._id
        );

        const accountMap = new Map();
        for (const acc of accounts) {
            accountMap.set(acc.wsnId, acc);
        }

        const snapshots = [];

        // 3. Build snapshots from active sessions
        for (const session of sessions) {
            const wsnId = session.name || session.user;
            const account = accountMap.get(wsnId);

            if (!account) continue;

            const snapshot = new UsageSnapshot({
                accountId: account.id,
                routerId: router._id,
                wsnId,

                online: true,

                ipAddress: session.address || null,
                macAddress:
                    session["caller-id"] ||
                    session["mac-address"] ||
                    null,

                uptime: session.uptime || "0s",

                downloadBytes: Number(session["bytes-in"] || 0),
                uploadBytes: Number(session["bytes-out"] || 0),

                lastSeenAt: new Date()
            });

            snapshots.push(snapshot);
        }

        // 4. Bulk upsert online users
        if (snapshots.length) {
            await this.usageRepository.bulkUpsert(snapshots);
        }

        // 5. Mark offline users (important)
        await this._markOfflineUsers(accounts, snapshots);
    }

    async _markOfflineUsers(accounts, snapshots) {
        const onlineSet = new Set(
            snapshots.map(s => s.wsnId)
        );

        for (const account of accounts) {
            if (!onlineSet.has(account.wsnId)) {
                await this.usageRepository.markOffline(account.id);
            }
        }
    }
}
import { UsageSnapshot } from "../domain/usage.entity.js";

export class SyncUsageUseCase {
    constructor({ mikrotikService, accountRepository, usageRepository }) {
        this.mikrotikService = mikrotikService;
        this.accountRepository = accountRepository;
        this.usageRepository = usageRepository;
    }

    // Added optional targetAccountId parameter
    async execute(router, serviceType = "pppoe", targetAccountId = null) {
        let accounts = [];
        let sessions = [];

        if (targetAccountId) {
            // 🎯 SINGLE ACCOUNT SYNC PIPELINE
            const account = await this.accountRepository.findById(targetAccountId);
            if (!account) return null;
            accounts = [account];

            // Tell Mikrotik to ONLY fetch this user's session (Massive performance save!)
            const singleSession = await this.mikrotikService.getSingleActiveSession(
                router,
                serviceType,
                account.wsnId // passing the username/PPPOE secret name
            );
            if (singleSession) sessions = [singleSession];
        } else {
            // 🌍 GLOBAL ROUTER CRON SYNC PIPELINE
            sessions = await this.mikrotikService.getActiveSessions(router, serviceType);
            if (!Array.isArray(sessions)) return;
            accounts = await this.accountRepository.findByRouterId(router._id);
        }

        const accountMap = new Map(accounts.map(acc => [acc.wsnId, acc]));
        const snapshots = [];

        for (const session of sessions) {
            const wsnId = session.name || session.user;
            const account = accountMap.get(wsnId);
            if (!account) continue;

            snapshots.push(new UsageSnapshot({
                accountId: account.id,
                routerId: router._id,
                wsnId,
                online: true,
                ipAddress: session.address || null,
                macAddress: session["caller-id"] || session["mac-address"] || null,
                uptime: session.uptime || "0s",
                downloadBytes: Number(session["bytes-out"] || 0), // Fix flipped bytes
                uploadBytes: Number(session["bytes-in"] || 0),
                lastSeenAt: new Date()
            }));
        }

        // Save active state
        if (snapshots.length) {
            await this.usageRepository.bulkUpsert(snapshots);
        }

        // Mark offline safely
        const onlineSet = new Set(snapshots.map(s => s.wsnId));
        for (const account of accounts) {
            if (!onlineSet.has(account.wsnId)) {
                await this.usageRepository.markOffline(account.id);
            }
        }

        return snapshots[0] || null;
    }
}

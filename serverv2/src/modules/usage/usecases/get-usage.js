export class GetUsageUseCase {
    constructor({ usageRepository }) {
        this.usageRepository = usageRepository;
    }

    async execute(accountId) {
        if (!accountId) {
            throw new Error("accountId is required");
        }

        const snapshot =
            await this.usageRepository.findByAccountId(accountId);

        if (!snapshot) return null;

        return {
            accountId: snapshot.accountId,
            routerId: snapshot.routerId,
            wsnId: snapshot.wsnId,

            online: snapshot.online,

            ipAddress: snapshot.ipAddress,
            macAddress: snapshot.macAddress,

            uptime: snapshot.uptime,

            downloadBytes: snapshot.rxBytes,
            uploadBytes: snapshot.txBytes,

            lastSeenAt: snapshot.lastSeenAt
        };
    }
}
export class SyncRouterInfo {
    constructor({ mikrotikService, routerRepository }) {
        this.mikrotikService = mikrotikService;
        this.routerRepository = routerRepository;
    }

    async execute(routerId) {
        const router =
            await this.routerRepository.findById(routerId);

        if (!router) {
            throw new Error("Router not found");
        }

        try {
            const info =
                await this.mikrotikService.getRouterInfo(router);

            return await this.routerRepository.update(routerId, {
                systemIdentity: info.identity,
                routerOsVersion: info.version,
                routerBoard: info.board,

                // ✅ ADD THIS (your ownership key)
                routerUid: info.routerUid,

                status: "online",
                lastError: null,
                lastSeenAt: new Date()
            });

        } catch (error) {
            console.error(error)
            return await this.routerRepository.update(routerId, {
                status: "offline",
                lastError: error.message
            });
        }
    }
}
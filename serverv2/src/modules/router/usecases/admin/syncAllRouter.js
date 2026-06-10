export class SyncAllRouters {
    constructor({ routerRepository, syncRouterInfo }) {
        this.routerRepository = routerRepository;
        this.syncRouterInfo = syncRouterInfo;
    }

    async execute() {
        const routers = await this.routerRepository.findAll();

        const results = [];

        for (const router of routers) {
            try {
                const updated =
                    await this.syncRouterInfo.execute(router.id);

                results.push({
                    id: router.id,
                    status: "synced",
                    router: updated
                });
            } catch (err) {
                results.push({
                    id: router.id,
                    status: "failed",
                    error: err.message
                });
            }
        }

        return results;
    }
}
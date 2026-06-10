export class CreateRouter {
    constructor({
        routerRepository,
        auditService,
        syncRouterInfo
    }) {
        this.routerRepository = routerRepository;
        this.auditService = auditService;
        this.syncRouterInfo = syncRouterInfo;
    }

    async execute({
        name,
        host,
        port,
        username,
        password,
        supportedServices = [],
        isDefaultRouter = false,
        hotspotIp = null,
        context
    }) {

        const exists =
            await this.routerRepository.findByHost(host);

        if (exists) {
            throw new Error(`Router with host ${host} already exists`);
        }

        const code = `RT-${Math.floor(Math.random() * 1000000)}`;

        const router =
            await this.routerRepository.create({
                name,
                host,
                port: port || 8728,
                username,
                password,
                supportedServices,
                isDefaultRouter,
                hotspotIp,
                code
            });

        // Sync RouterOS information
        try {
            if (this.syncRouterInfo) {
                await this.syncRouterInfo.execute(router._id);
            }
        } catch (err) {
            console.error(
                `Failed to sync router ${router.host}:`,
                err.message
            );
        }

        if (this.auditService && context) {
            await this.auditService.log({
                actorId: context.actorId || "SYSTEM_ADMIN",
                action: "CREATE_ROUTER",
                targetId: router._id,
                resource: "Router",
                metadata: {
                    host: router.host,
                    name: router.name,
                    supportedServices,
                    isDefaultRouter,
                    hotspotIp
                },
                ip: context.ip,
                userAgent: context.userAgent
            });
        }

        return router;
    }
}
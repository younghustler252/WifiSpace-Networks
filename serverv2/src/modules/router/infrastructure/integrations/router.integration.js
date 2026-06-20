export class RouterIntegration {
    constructor({ mikrotikClient }) {
        this.mikrotikClient = mikrotikClient;
    }

    async getIdentity(router) {
        return this.mikrotikClient.execute(
            router,
            "/system/identity/print",
            []
        );
    }

    async getResources(router) {
        return this.mikrotikClient.execute(
            router,
            "/system/resource/print",
            []
        );
    }

    async getAddresses(router) {
        return this.mikrotikClient.execute(
            router,
            "/ip/address/print",
            []
        );
    }

    async getRouterInfo(router) {
        const [identity, resource, addresses, board] = await Promise.all([
            this.getIdentity(router),
            this.getResources(router),
            this.getAddresses(router),
            this.mikrotikClient.execute(
                router,
                "/system/routerboard/print",
                []
            )
        ]);

        const routerUid =
            board?.[0]?.["serial-number"] ||
            resource?.[0]?.uuid ||
            identity?.[0]?.name;

        return {
            identity: identity?.[0]?.name,
            version: resource?.[0]?.version,
            board: resource?.[0]?.["board-name"],
            routerUid,
            addresses
        };
    }
}
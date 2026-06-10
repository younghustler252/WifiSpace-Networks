import { mikrotikClient } from "../client/mikrotik.client.js";


export class RouterIntegration {
    async getIdentity(router) {
        return mikrotikClient.execute(router, "/system/identity/print", []);
    }

    async getResources(router) {
        return mikrotikClient.execute(router, "/system/resource/print", []);
    }

    async getAddresses(router) {
        return mikrotikClient.execute(router, "/ip/address/print", []);
    }

    async getRouterInfo(router) {
    const [identity, resource, addresses, board] = await Promise.all([
        this.getIdentity(router),
        this.getResources(router),
        this.getAddresses(router),
        mikrotikClient.execute(router, "/system/routerboard/print", [])
    ]);

    const routerUid =
        board?.[0]?.["serial-number"] ||
        resource?.[0]?.uuid ||
        identity?.[0]?.name; // fallback only

    return {
        identity: identity?.[0]?.name,
        version: resource?.[0]?.version,
        board: resource?.[0]?.["board-name"],
        routerUid,
        addresses
    };
}
}
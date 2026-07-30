import { asClass } from "awilix";

import { NetworkService } from "./services/network.service.js";

export function registerProvisioning(container) {
    container.register({
        networkService: asClass(NetworkService).scoped(),
    });

}
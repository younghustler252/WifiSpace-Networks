import { asClass } from "awilix";

import { NetworkService } from "./services/network.service.js";
import { RouterProvisioningRepositoryMongo } from "./repositories/router-provisioning.repository.mongo.js";

export function registerProvisioning(container) {
    container.register({
        networkService: asClass(NetworkService).scoped(),
        routerProvisioningRepository: asClass(RouterProvisioningRepositoryMongo).singleton()
    });

}
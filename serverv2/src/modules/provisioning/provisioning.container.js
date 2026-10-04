import { asClass } from "awilix";

import { NetworkService } from "./services/network.service.js";
import { RouterProvisioningRepositoryMongo } from "./repositories/router-provisioning.repository.mongo.js";

import { MikrotikClient } from "./connection/mikrotik.client.js";
import { MikrotikManager } from "./mikrotik.manager.js";

import { HotspotService } from "./services/hotspot.service.js";
import { PppoeService } from "./services/pppoe.service.js";
import { IpoeService } from "./services/ipoe.service.js";
import { RouterService } from "./services/router.service.js";

export function registerProvisioning(container) {
	container.register({
		networkService: asClass(NetworkService).scoped(),
		routerProvisioningRepository: asClass(RouterProvisioningRepositoryMongo).singleton(),

		mikrotikClient: asClass(MikrotikClient).singleton(),
		hotspotService: asClass(HotspotService).singleton(),
		pppoeService: asClass(PppoeService).singleton(),
		ipoeService: asClass(IpoeService).singleton(),
		routerService: asClass(RouterService).singleton(),
		mikrotikManager: asClass(MikrotikManager).singleton()
	});
}

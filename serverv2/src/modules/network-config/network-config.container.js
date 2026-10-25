import { asClass } from "awilix";
import { NetworkConfigRepositoryMongo } from "./repositories/network-config.repository.mongo.js";
import { RouterConfigDriver } from "./services/router-config.driver.js";
import { HotspotProfileGuard } from "./services/hotspot-profile-guard.js";
import { NetworkConfigDispatcher } from "./services/network-config-dispatcher.js";

import { ListHotspotProfiles, CreateHotspotProfile, UpdateHotspotProfile, DeleteHotspotProfile } from "./usecases/admin/hotspot-profiles.usecases.js";
import { ListWalledGardenEntries, CreateWalledGardenEntry, UpdateWalledGardenEntry, DeleteWalledGardenEntry } from "./usecases/admin/walled-garden.usecases.js";
import { ImportNetworkConfig } from "./usecases/admin/import-network-config.usecase.js";
import { GetNetworkConfigStatus } from "./usecases/admin/get-network-config-status.usecase.js";
import { SyncNetworkConfig } from "./usecases/system/sync-network-config.usecase.js";
import { NetworkConfigController } from "./controllers/network-config.controller.js";

export function registerNetworkConfig(container) {
	container.register({
		networkConfigRepository: asClass(NetworkConfigRepositoryMongo).singleton(),
		routerConfigDriver: asClass(RouterConfigDriver).singleton(),
		networkConfigDispatcher: asClass(NetworkConfigDispatcher).singleton(),
		hotspotProfileGuard: asClass(HotspotProfileGuard).singleton(),

		listHotspotProfiles: asClass(ListHotspotProfiles).scoped(),
		createHotspotProfile: asClass(CreateHotspotProfile).scoped(),
		updateHotspotProfile: asClass(UpdateHotspotProfile).scoped(),
		deleteHotspotProfile: asClass(DeleteHotspotProfile).scoped(),
		listWalledGardenEntries: asClass(ListWalledGardenEntries).scoped(),
		createWalledGardenEntry: asClass(CreateWalledGardenEntry).scoped(),
		updateWalledGardenEntry: asClass(UpdateWalledGardenEntry).scoped(),
		deleteWalledGardenEntry: asClass(DeleteWalledGardenEntry).scoped(),
		importNetworkConfig: asClass(ImportNetworkConfig).scoped(),
		getNetworkConfigStatus: asClass(GetNetworkConfigStatus).scoped(),
		syncNetworkConfig: asClass(SyncNetworkConfig).scoped(),

		networkConfigController: asClass(NetworkConfigController).scoped()
	});
}

import { asClass } from "awilix";

import { RouterRepositoryMongo } from "./repositories/router.repository.mongo.js";

import { CreateRouter } from "./usecases/admin/create-router.usecase.js";
import { UpdateRouter } from "./usecases/admin/update-router.usecase.js";
import { DeleteRouter } from "./usecases/admin/delete-router.usecase.js";
import { GetAllRouters } from "./usecases/admin/get-all-routers.usecase.js";
import { GetRouterById } from "./usecases/admin/get-router-by-id.usecase.js";
import { SyncRouterInfo } from "./usecases/admin/sync-router-info.usecase.js";
import { SyncAllRouters } from "./usecases/admin/sync-all-routers.usecase.js";
import { RebootRouter } from "./usecases/admin/reboot-router.usecase.js";
import { GetRouterProfiles } from "./usecases/admin/get-router-profiles.usecase.js";

import { RouterController } from "./controllers/router.controller.js";

export function registerRouter(container) {
	container.register({
		routerRepository: asClass(RouterRepositoryMongo).singleton(),

		createRouter: asClass(CreateRouter).scoped(),
		updateRouter: asClass(UpdateRouter).scoped(),
		deleteRouter: asClass(DeleteRouter).scoped(),
		getAllRouters: asClass(GetAllRouters).scoped(),
		getRouterById: asClass(GetRouterById).scoped(),
		syncRouterInfo: asClass(SyncRouterInfo).scoped(),
		syncAllRouters: asClass(SyncAllRouters).scoped(),
		rebootRouter: asClass(RebootRouter).scoped(),
		getRouterProfiles: asClass(GetRouterProfiles).scoped(),

		routerController: asClass(RouterController).scoped()
	});
}
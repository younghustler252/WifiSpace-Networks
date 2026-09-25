// src/modules/router/router.container.js

import { asClass } from "awilix";

// REPOSITORIES
import { RouterRepositoryMongo } from "./repositories/router.repository.mongo.js";
import { RouterProvisioningRepositoryMongo } from "./repositories/router-provisioning.repository.mongo.js";

import { CheckRouterStatus } from "./usecases/account/check-router-status.js";
import { RebootRouter } from "./usecases/account/reboot-router.js";

// USE CASES - ADMIN
import { CreateRouter } from "./usecases/admin/create-router.js";
import { UpdateRouter } from "./usecases/admin/update-router.js";
import { DeleteRouter } from "./usecases/admin/delete-router.js";
import { ListRouters } from "./usecases/admin/list-routers.js";
import { GetRouterProfiles } from "./usecases/account/get-router-profiles.js";
import { SyncRouterInfo } from "./usecases/admin/sync-router-info.js";
import { SyncAllRouters } from "./usecases/admin/syncAllRouter.js";

import { RouterController } from ".//controller/router.controller.js";

export function registerRouter(container) {

	// -------------------------
	// REPOSITORY
	// -------------------------
	container.register({
		routerRepository: asClass(RouterRepositoryMongo).singleton(),
		routerProvisioningRepository: asClass(RouterProvisioningRepositoryMongo).singleton()
	});


	// -------------------------
	// USE CASES - ACCOUNT
	// -------------------------
	container.register({
		checkRouterStatus: asClass(CheckRouterStatus).scoped(),
		rebootRouter: asClass(RebootRouter).scoped()
	});

	// -------------------------
	// USE CASES - ADMIN
	// -------------------------
	container.register({
		createRouter: asClass(CreateRouter).scoped(),
		updateRouter: asClass(UpdateRouter).scoped(),
		deleteRouter: asClass(DeleteRouter).scoped(),
		listRouters: asClass(ListRouters).scoped(),
		getRouterProfiles: asClass(GetRouterProfiles).scoped(),
		syncRouterInfo: asClass(SyncRouterInfo).scoped(),
		syncAllRouters: asClass(SyncAllRouters).scoped()
	});

	
	// -------------------------
	// CONTROLLERS
	// -------------------------
	container.register({
		routerController: asClass(RouterController).scoped(),
		// routerProvisioningController: asClass(RouterProvisioningController).scoped(),
	})
}
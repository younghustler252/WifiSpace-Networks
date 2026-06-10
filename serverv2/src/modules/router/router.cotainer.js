// src/modules/router/router.container.js

import { asClass } from "awilix";

// REPOSITORIES
import { RouterRepositoryMongo } from "./infrastructure/repositories/router.repository.mongo.js";

// SERVICES
import { MikrotikService } from "./services/mikrotik.service.js";

// USE CASES - ACCOUNT
import { CreateRouterAccount } from "./usecases/account/create-router-account.js";
import { ProvisionNetworkAccount } from "./usecases/account/provision-network-account.js";
import { SuspendNetworkAccount } from "./usecases/account/suspend-network-account.js";
import { ResumeNetworkAccount } from "./usecases/account/resume-network.js";
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

import { RouterAdminController } from "./presentation/controller/admin.controller.js";
import { RouterProvisioningController } from "./presentation/controller/provisioning.controller.js";

import { PppoeIntegration } from "./infrastructure/integrations/pppoe.integration.js";
import { HotspotIntegration } from "./infrastructure/integrations/hotspot.integration.js";
import { RouterIntegration } from "./infrastructure/integrations/router.integration.js";

export function registerRouter(container) {

	// -------------------------
	// REPOSITORY
	// -------------------------
	container.register({
		routerRepository: asClass(RouterRepositoryMongo).singleton()
	});

	// -------------------------
	// SERVICES
	// -------------------------
	container.register({
		mikrotikService: asClass(MikrotikService).singleton(),
		pppoeIntegration: asClass(PppoeIntegration).singleton(),
		hotspotIntegration: asClass(HotspotIntegration).singleton(),
		routerIntegration: asClass(RouterIntegration).singleton()
	});

	// -------------------------
	// USE CASES - ACCOUNT
	// -------------------------
	container.register({
		createRouterAccount: asClass(CreateRouterAccount).scoped(),
		provisionNetworkAccount: asClass(ProvisionNetworkAccount).scoped(),
		suspendNetworkAccount: asClass(SuspendNetworkAccount).scoped(),
		resumeNetworkAccount: asClass(ResumeNetworkAccount).scoped(),
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

	container.register({
		routerAdminController: asClass(RouterAdminController).scoped(),
		routerProvisioningController: asClass(RouterProvisioningController).scoped(),

	})
}
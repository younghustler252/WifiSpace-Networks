import { asClass } from "awilix";

import { HotspotSessionRepositoryMongo } from "./repositories/hotspot-session.repository.mongo.js";

import { RegisterHotspotUser } from "./usecases/user/register-hotspot-user.usecase.js";
import { AuthenticateHotspotSession } from "./usecases/user/authenticate-hotspot-session.usecase.js";
import { ResolveHotspotSession } from "./usecases/user/resolve-hotspot-session.usecase.js";
import { RefreshHotspotSession } from "./usecases/user/refresh-hotspot-session.usecase.js";
import { RevokeHotspotSession } from "./usecases/user/revoke-hotspot-session.usecase.js";
import { GetHotspotSession } from "./usecases/user/get-hotspot-session.usecase.js";
import { GetHotspotPlans } from "./usecases/user/get-hotspot-plans.usecase.js";
import { GetHotspotConnectionStatus } from "./usecases/user/get-hotspot-connection-status.usecase.js";
import { HotspotCheckoutFlow } from "./usecases/user/hotspot-checkout.usecase.js";
import { StartHotspot } from "./usecases/user/start-hotspot.usecase.js";
import { ConfirmHotspot } from "./usecases/system/confirm-hotspot.usecase.js";
import { RegisterHotspotDevice } from "./usecases/user/register-hotspot-device.usecase.js";

import { GetAccountDevices } from "./usecases/admin/get-account-devices.usecase.js";
import { GetAccountLocations } from "./usecases/admin/get-account-locations.usecase.js";


import { HotspotController } from "./controllers/hotspot.controller.js";
import { AdminController } from "./controllers/admin.controller.js";


export function registerHotspot(container) {
	container.register({
		hotspotSessionRepository: asClass(HotspotSessionRepositoryMongo).singleton(),

		registerHotspotUser: asClass(RegisterHotspotUser).scoped(),
		authenticateHotspotSession: asClass(AuthenticateHotspotSession).scoped(),
		resolveHotspotSession: asClass(ResolveHotspotSession).scoped(),
		refreshHotspotSession: asClass(RefreshHotspotSession).scoped(),
		revokeHotspotSession: asClass(RevokeHotspotSession).scoped(),
		getHotspotSession: asClass(GetHotspotSession).scoped(),
		getHotspotPlans: asClass(GetHotspotPlans).scoped(),
		getHotspotConnectionStatus: asClass(GetHotspotConnectionStatus).scoped(),
		hotspotCheckoutFlow: asClass(HotspotCheckoutFlow).scoped(),
		startHotspot: asClass(StartHotspot).scoped(),
		confirmHotspot: asClass(ConfirmHotspot).scoped(),
		registerHotspotDevice: asClass(RegisterHotspotDevice).scoped(),

		getAccountDevices: asClass(GetAccountDevices).scoped(),
		getAccountLocations: asClass(GetAccountLocations).scoped(),
		
		
		hotspotAdminController: asClass(AdminController).scoped(),
		hotspotController: asClass(HotspotController).scoped()
	});
}
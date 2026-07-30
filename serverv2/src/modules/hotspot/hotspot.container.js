import { asClass } from "awilix";

// Use Cases
import { StartHotspotPurchase } from "./usecases/start-hotspot.js";
import { ConfirmHotspotPurchase } from "./usecases/confirm-hotspot.js";
import { GetHotspotPlans } from "./usecases/get-hotspot-plans.js";
import { RegisterHotspotUser } from "./usecases/register-hotspot.usecase.js";
import { GetHotspotSession } from "./usecases/get-hotspot-session.js";
import { HotspotCheckoutFlow } from "./usecases/hotspot-checkout.js";

// Session Use Cases
import { AuthenticateHotspotSession } from "./usecases/authenticate-hotspot-session.js";
import { RevokeHotspotSession } from "./usecases/revoke-hotspot-session.js";
import { ResolveHotspotSession } from "./usecases/resolve-hotspot-session.js";

// Repository
import { HotspotSessionRepositoryMongo } from "./repositories/hotspot-session.repository.mongo.js";

// Controller
import { HotspotController } from "./controller/hotspot.controller.js";

export function registerHotspot(container) {
	container.register({
		// Repositories
		hotspotSessionRepository: asClass(
			HotspotSessionRepositoryMongo
		).scoped(),

		// Use Cases
		startHotspotPurchase: asClass(StartHotspotPurchase).scoped(),
		registerHotspotUser: asClass(RegisterHotspotUser).scoped(),
		confirmHotspotPurchase: asClass(ConfirmHotspotPurchase).scoped(),
		getHotspotPlans: asClass(GetHotspotPlans).scoped(),
		getHotspotSession: asClass(GetHotspotSession).scoped(),
		hotspotCheckoutFlow: asClass(HotspotCheckoutFlow).scoped(),

		// Session
		authenticateHotspotSession: asClass(
			AuthenticateHotspotSession
		).scoped(),
		revokeHotspotSession: asClass(
			RevokeHotspotSession
		).scoped(),
        resolveHotspotSession: asClass(ResolveHotspotSession).scoped(),

		// Controller
		hotspotController: asClass(HotspotController).scoped()
	});
}
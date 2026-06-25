import { asClass } from "awilix";

// Use Cases
import { StartHotspotPurchase } from "./usecases/start-hotspot.js";
import { ConfirmHotspotPurchase } from "./usecases/confirm-hotspot.js";
import { GetHotspotPlans } from "./usecases/get-hotspot-plans.js";
import { RegisterHotspotUser } from "./usecases/register-hotspot.usecase.js";
import { ActivateHotspotAccess } from "./usecases/activate-hotspot-accss.js";
import { GetHotspotSession } from "./usecases/get-hotspot-session.js";
import { HotspotCheckoutFlow } from "./usecases/hotspot-checkout.js";


// Controller
import { HotspotController } from "./controller/hotspot.controller.js";

export function registerHotspot(container) {
    container.register({
        // Use Cases
        startHotspotPurchase: asClass(StartHotspotPurchase).scoped(),
        registerHotspotUser: asClass(RegisterHotspotUser).scoped(),
        confirmHotspotPurchase: asClass(ConfirmHotspotPurchase).scoped(),
        getHotspotPlans: asClass(GetHotspotPlans).scoped(),
        activateHotspotAccess: asClass(ActivateHotspotAccess).scoped(),
        getHotspotSession: asClass(GetHotspotSession).scoped(),
        hotspotCheckoutFlow: asClass(HotspotCheckoutFlow).scoped(),

        // Controller
        hotspotController: asClass(HotspotController).scoped(),
    });
}
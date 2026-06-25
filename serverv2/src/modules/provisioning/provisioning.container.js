import { asClass } from "awilix";

import { HotspotActivatior } from "./services/hotspot-activator.js";
import { PppoeActivatior } from "./services/ppoe-activator.js";
import { ServiceActivationService } from "./services/service-activation.engine.js";

export function registerProvisioning(container) {
    container.register({
        hotspotActivator: asClass(HotspotActivatior).scoped(),
        pppoeActivator: asClass(PppoeActivatior).scoped(),
        serviceActivationService: asClass(ServiceActivationService).scoped(),
    });

}
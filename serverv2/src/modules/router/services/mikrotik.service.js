// src/services/mikrotik.service.js
import { PppoeIntegration } from "../infrastructure/integrations/pppoe.integration.js";
import { HotspotIntegration } from "../infrastructure/integrations/hotspot.integration.js";
import { ValidationError } from "../../../shared/errors/validation-error.js";

export class MikrotikService {
    constructor({ pppoeIntegration = new PppoeIntegration(), hotspotIntegration = new HotspotIntegration() } = {}) {
        this.pppoeIntegration = pppoeIntegration;
        this.hotspotIntegration = hotspotIntegration;
    }

    _integrationFor(account) {
        if (!account || !account.serviceType) throw new ValidationError("Account or serviceType is missing");
        if (account.serviceType === "pppoe") return this.pppoeIntegration;
        if (account.serviceType === "hotspot") return this.hotspotIntegration;
        throw new ValidationError(`Unsupported serviceType: ${account.serviceType}`);
    }

    // ==================================================
    // Polmorphic Client Router Actions
    // ==================================================

    async createAccount(account, router) {
        const integration = this._integrationFor(account);
        return integration.createUser(router, account);
    }

    async suspendAccount(account, router) {
        const integration = this._integrationFor(account);
        return integration.suspendUser(router, account.wsnId);
    }

    async resumeAccount(account, router) {
        const integration = this._integrationFor(account);
        return integration.resumeUser(router, account.wsnId);
    }

    async removeAccount(account, router) {
        const integration = this._integrationFor(account);
        // Uses the lower-level target remove endpoints if required
        const endpoint = account.serviceType === "pppoe" ? "/ppp/secret/remove" : "/ip/hotspot/user/remove";
        return account.serviceType === "pppoe" 
            ? this.pppoeIntegration.constructor.prototype.hasOwnProperty('removeUser') // customized route fallback
                ? integration.removeUser(router, account.wsnId)
                : import("../client/mikrotik.client.js").then(m => m.mikrotikClient.execute(router, endpoint, [`=numbers=${account.wsnId}`]))
            : import("../client/mikrotik.client.js").then(m => m.mikrotikClient.execute(router, endpoint, [`=numbers=${account.wsnId}`]));
    }

    async disconnectAccount(account, router) {
        const integration = this._integrationFor(account);
        return integration.disconnectUser(router, account.wsnId);
    }

    // ==================================================
    // Administrative Infrastructure Actions
    // ==================================================

    async getSystemResources(router) {
        // Core resource printing commands are independent of profile type
        return this.pppoeIntegration.getSystemResources(router);
    }

    async executeReboot(router) {
        return this.pppoeIntegration.reboot(router);
    }

    async fetchRouterProfiles(router, serviceType) {
        if (serviceType === "pppoe") {
            return this.pppoeIntegration.getProfiles(router);
        }
        return this.hotspotIntegration.getProfiles(router);
    }
}
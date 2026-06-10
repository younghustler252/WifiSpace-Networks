// src/services/mikrotik.service.js
import { ValidationError } from "../../../shared/errors/validation-error.js";

export class MikrotikService {
    constructor({
        pppoeIntegration,
        hotspotIntegration,
        routerIntegration
    } = {}) {
        this.pppoeIntegration = pppoeIntegration;
        this.hotspotIntegration = hotspotIntegration;
        this.routerIntegration = routerIntegration; 
    }   

    _integration(account) {
        if (!account?.serviceType) {
            throw new ValidationError("Account serviceType is required");
        }

        if (account.serviceType === "pppoe") return this.pppoeIntegration;
        if (account.serviceType === "hotspot") return this.hotspotIntegration;

        throw new ValidationError(`Unsupported serviceType: ${account.serviceType}`);
    }

    // ==================================================
    // USER OPERATIONS (ISP CORE)
    // ==================================================

    async createAccount(account, router) {
        return this._integration(account).createUser(router, account);
    }

    async suspendAccount(account, router) {
        return this._integration(account).suspendUser(router, account.wsnId);
    }

    async resumeAccount(account, router) {
        return this._integration(account).resumeUser(router, account.wsnId);
    }

    async disconnectAccount(account, router) {
        return this._integration(account).disconnectUser(router, account.wsnId);
    }

    async updateAccount(account, router) {
        return this._integration(account).updateUser?.(router, account);
    }

    async checkUserExists(account, router) {
        return this._integration(account).checkUserExists(router, account.wsnId);
    }

    async removeAccount(account, router) {
        return this._integration(account).removeUser(router, account.wsnId);
    }

    // ==================================================
    // ROUTER LEVEL ACTIONS (NOT ACCOUNT-SPECIFIC)
    // ==================================================

    async getSystemResources(router) {
        // system info is router-level, not PPPoE-specific
        return this.pppoeIntegration.getSystemResources(router);
    }

    async executeReboot(router) {
        return this.pppoeIntegration.reboot(router);
    }

    async fetchRouterProfiles(router, serviceType = "pppoe") {
        if (serviceType === "hotspot") {
            return this.hotspotIntegration.getProfiles(router);
        }
        return this.pppoeIntegration.getProfiles(router);
    }
    async provisionAccess(account, router, payload) {
        return this._integration(account).provisionAccess?.(
            router,
            payload
        );
    }
  
    async getRouterInfo(router) {
        return this.routerIntegration.getRouterInfo(router);
    }

    // src/services/mikrotik.service.js

    async changePassword(account, router, password) {
        return this._integration(account).changePassword(
            router,
            account.wsnId,
            password
        );
    }
    async getActiveSessions(router, serviceType = "pppoe") {
        const integration =
            serviceType === "hotspot"
                ? this.hotspotIntegration
                : this.pppoeIntegration;

        return integration.getActiveSessions(router);
    }

    async getActiveUser(account, router) {
        const integration = this._integration(account);
        return integration.getActiveUser?.(router, account.wsnId);
    }

    async getUsageSource(account, router) {
        const integration = this._integration(account);

        const session = await integration.getActiveUser?.(
            router,
            account.wsnId
        );

        if (!session) return null;

        return {
            wsnId: account.wsnId,
            downloadBytes: Number(session["bytes-in"] || 0),
            uploadBytes: Number(session["bytes-out"] || 0),
            uptime: session.uptime,
            ipAddress: session.address,
            macAddress:
                session["caller-id"] ||
                session["mac-address"] ||
                null
        };
    }
}
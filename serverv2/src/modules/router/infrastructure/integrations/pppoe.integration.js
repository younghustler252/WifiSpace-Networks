// src/infrastructure/mikrotik/PppoeIntegration.js
import { mikrotikClient } from "../client/mikrotik.client.js";

export class PppoeIntegration {
    // ==================================================
    // Account Lifecyle Management
    // ==================================================

    async createUser(router, account) {
        const params = [
            `=name=${account.wsnId}`,
            `=password=${account.routerPassword}`,
            `=service=pppoe`,
            `=profile=${account.routerProfile || "default"}`,
        ];

        return mikrotikClient.execute(router, "/ppp/secret/add", params);
    }

    async suspendUser(router, wsnId) {
        return mikrotikClient.execute(router, "/ppp/secret/set", [
            `=numbers=${wsnId}`,
            `=disabled=yes`,
        ]);
    }

    async resumeUser(router, wsnId) {
        return mikrotikClient.execute(router, "/ppp/secret/set", [
            `=numbers=${wsnId}`,
            `=disabled=no`,
        ]);
    }

    async disconnectUser(router, wsnId) {
        // Warning: MikroTik requires the internal identifier or active name.
        // If your custom client supports names for numbers, this works perfectly.
        return mikrotikClient.execute(router, "/ppp/active/remove", [
            `=numbers=${wsnId}`,
        ]);
    }

    // ==================================================
    // Hardware Admin & Profiling Extensions
    // ==================================================

    async getSystemResources(router) {
        return mikrotikClient.execute(router, "/system/resource/print", []);
    }

    async reboot(router) {
        return mikrotikClient.execute(router, "/system/reboot", []);
    }

    async getProfiles(router) {
        return mikrotikClient.execute(router, "/ppp/profile/print", []);
    }
}
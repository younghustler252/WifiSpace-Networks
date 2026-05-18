// src/infrastructure/mikrotik/HotspotIntegration.js
import { mikrotikClient } from "../client/mikrotik.client.js";

export class HotspotIntegration {
    // ==================================================
    // Account Lifecyle Management
    // ==================================================

    async createUser(router, account) {
        const params = [
            `=name=${account.wsnId}`,
            `=password=${account.routerPassword}`,
            `=profile=${account.routerProfile || "default"}`,
        ];

        // Handles limit-uptime or limit-bytes-total if passed via the snapshot properties
        if (account.currentLimitUptime && account.currentLimitUptime !== "0") {
            params.push(`=limit-uptime=${account.currentLimitUptime}`);
        }
        if (account.currentLimitBytes && account.currentLimitBytes > 0) {
            params.push(`=limit-bytes-total=${account.currentLimitBytes}`);
        }

        return mikrotikClient.execute(router, "/ip/hotspot/user/add", params);
    }

    async suspendUser(router, wsnId) {
        return mikrotikClient.execute(router, "/ip/hotspot/user/set", [
            `=numbers=${wsnId}`,
            `=disabled=yes`,
        ]);
    }

    async resumeUser(router, wsnId) {
        return mikrotikClient.execute(router, "/ip/hotspot/user/set", [
            `=numbers=${wsnId}`,
            `=disabled=no`,
        ]);
    }

    async disconnectUser(router, wsnId) {
        // Hotspot active bindings are dropped under the active sub-menu
        return mikrotikClient.execute(router, "/ip/hotspot/active/remove", [
            `=numbers=${wsnId}`,
        ]);
    }

    // ==================================================
    // Hardware Admin & Profiling Extensions
    // ==================================================

    async getProfiles(router) {
        return mikrotikClient.execute(router, "/ip/hotspot/user/profile/print", []);
    }
}
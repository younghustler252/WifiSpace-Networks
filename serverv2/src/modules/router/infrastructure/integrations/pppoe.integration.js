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

    async checkUserExists(router, wsnId) {
        const users = await mikrotikClient.execute(
            router,
            "/ppp/secret/print",
            [`?name=${wsnId}`]
        );

        return Array.isArray(users) && users.length > 0;
    }

    async removeUser(router, wsnId) {
        return mikrotikClient.execute(router, "/ppp/secret/remove", [
            `=numbers=${wsnId}`,
        ]);
    }

    async changePassword(router, username, password) {
        const secrets = await mikrotikClient.execute(
            router,
            "/ppp/secret/print",
            [`?name=${username}`]
        );

        if (!Array.isArray(secrets) || secrets.length === 0) {
            throw new Error(`PPP secret '${username}' not found`);
        }

        const secretId = secrets[0][".id"];

        return mikrotikClient.execute(router, "/ppp/secret/set", [
            `=.id=${secretId}`,
            `=password=${password}`,
        ]);
    }

    async getActiveUsers(router) {
        return mikrotikClient.execute(
            router,
            "/ppp/active/print",
            []
        );
    }

    async getActiveUser(router, wsnId) {
        const res = await mikrotikClient.execute(
            router,
            "/ppp/active/print",
            [`?name=${wsnId}`]
        );

        return Array.isArray(res) ? res[0] : null;
    }
     

    async getActiveSessions(router) {
    return mikrotikClient.execute(
        router,
        "/ppp/active/print",
        []
    );
}
}
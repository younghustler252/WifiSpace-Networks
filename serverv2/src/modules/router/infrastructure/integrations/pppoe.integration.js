// src/infrastructure/mikrotik/PppoeIntegration.js

export class PppoeIntegration {
    constructor({ mikrotikClient }) {
        if (!mikrotikClient) {
            throw new Error("mikrotikClient is required");
        }

        this.mikrotikClient = mikrotikClient;
    }

    // ==================================================
    // ACCOUNT LIFECYCLE MANAGEMENT
    // ==================================================

    async createUser(router, account) {
        const params = [
            `=name=${account.wsnId}`,
            `=password=${account.routerPassword}`,
            `=service=pppoe`,
            `=profile=${account.routerProfile || "default"}`
        ];

        return this.mikrotikClient.execute(
            router,
            "/ppp/secret/add",
            params
        );
    }

    async suspendUser(router, wsnId) {
        const secret = await this._findSecret(router, wsnId);

        return this.mikrotikClient.execute(router, "/ppp/secret/set", [
            `=.id=${secret[".id"]}`,
            `=disabled=yes`
        ]);
    }

    async resumeUser(router, wsnId) {
        const secret = await this._findSecret(router, wsnId);

        return this.mikrotikClient.execute(router, "/ppp/secret/set", [
            `=.id=${secret[".id"]}`,
            `=disabled=no`
        ]);
    }

    async disconnectUser(router, wsnId) {
        return this.mikrotikClient.execute(router, "/ppp/active/remove", [
            `=numbers=${wsnId}`
        ]);
    }

    // ==================================================
    // ADMIN / SYSTEM
    // ==================================================

    async getSystemResources(router) {
        return this.mikrotikClient.execute(router, "/system/resource/print", []);
    }

    async reboot(router) {
        return this.mikrotikClient.execute(router, "/system/reboot", []);
    }

    async getProfiles(router) {
        return this.mikrotikClient.execute(router, "/ppp/profile/print", []);
    }

    async checkUserExists(router, wsnId) {
        const users = await this.mikrotikClient.execute(
            router,
            "/ppp/secret/print",
            [`?name=${wsnId}`]
        );

        return Array.isArray(users) && users.length > 0;
    }

    async removeUser(router, wsnId) {
        const secret = await this._findSecret(router, wsnId);

        return this.mikrotikClient.execute(router, "/ppp/secret/remove", [
            `=.id=${secret[".id"]}`
        ]);
    }

    async changePassword(router, username, password) {
        const secret = await this._findSecret(router, username);

        return this.mikrotikClient.execute(router, "/ppp/secret/set", [
            `=.id=${secret[".id"]}`,
            `=password=${password}`
        ]);
    }

    // ==================================================
    // ACTIVE USERS
    // ==================================================

    async getActiveUsers(router) {
        return this.mikrotikClient.execute(
            router,
            "/ppp/active/print",
            []
        );
    }

    async getActiveUser(router, wsnId) {
        const res = await this.mikrotikClient.execute(
            router,
            "/ppp/active/print",
            [`?name=${wsnId}`]
        );

        return Array.isArray(res) ? res[0] : null;
    }

    async getActiveSessions(router) {
        return this.mikrotikClient.execute(
            router,
            "/ppp/active/print",
            []
        );
    }

    // ==================================================
    // INTERNAL HELPERS
    // ==================================================

    async _findSecret(router, wsnId) {
        const secrets = await this.mikrotikClient.execute(
            router,
            "/ppp/secret/print",
            [`?name=${wsnId}`]
        );

        if (!Array.isArray(secrets) || secrets.length === 0) {
            throw new Error(`PPP secret not found: ${wsnId}`);
        }

        return secrets[0];
    }
}
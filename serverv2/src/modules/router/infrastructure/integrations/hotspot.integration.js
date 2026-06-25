// src/infrastructure/mikrotik/HotspotIntegration.js

import { formatUptime } from "../../../../shared/utils/formatUptime.js";

export class HotspotIntegration {
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
            `=profile=${account.routerProfile || "default"}`
        ];

        if (account.limitUptime && account.limitUptime > 0) {
            const uptime = formatUptime(Number(account.limitUptime));
            params.push(`=limit-uptime=${uptime}`);
        }

        return this.mikrotikClient.execute(
            router,
            "/ip/hotspot/user/add",
            params
        );
    }

    async changePassword(router, username, password) {
        const users = await this.mikrotikClient.execute(
            router,
            "/ip/hotspot/user/print",
            [`?name=${username}`]
        );

        if (!Array.isArray(users) || users.length === 0) {
            throw new Error(`User not found: ${username}`);
        }

        return this.mikrotikClient.execute(router, "/ip/hotspot/user/set", [
            `=.id=${users[0][".id"]}`,
            `=password=${password}`
        ]);
    }

    async suspendUser(router, wsnId) {
        return this.mikrotikClient.execute(router, "/ip/hotspot/user/set", [
            `=numbers=${wsnId}`,
            `=disabled=yes`
        ]);
    }

    async resumeUser(router, wsnId) {
        return this.mikrotikClient.execute(router, "/ip/hotspot/user/set", [
            `=numbers=${wsnId}`,
            `=disabled=no`
        ]);
    }

    async disconnectUser(router, wsnId) {
        return this.mikrotikClient.execute(router, "/ip/hotspot/active/remove", [
            `=user=${wsnId}`
        ]);
    }

    // ==================================================
    // EXTENSIONS
    // ==================================================

    async getProfiles(router) {
        return this.mikrotikClient.execute(
            router,
            "/ip/hotspot/user/profile/print",
            []
        );
    }

    async checkUserExists(router, wsnId) {
        const users = await this.mikrotikClient.execute(
            router,
            "/ip/hotspot/user/print",
            [`?name=${wsnId}`]
        );

        return Array.isArray(users) && users.length > 0;
    }

    async getActiveSessions(router) {
        return this.mikrotikClient.execute(
            router,
            "/ip/hotspot/active/print",
            []
        );
    }

    async getActiveUser(router, wsnId) {
        const res = await this.mikrotikClient.execute(
            router,
            "/ip/hotspot/active/print",
            [`?user=${wsnId}`]
        );

        return Array.isArray(res) ? res[0] : null;
    }

    // ==================================================
    // SESSION CONTROL
    // ==================================================

    async forceReconnect(router, macAddress) {
        if (!macAddress) return;

        const active = await this.mikrotikClient.execute(
            router,
            "/ip/hotspot/active/print",
            []
        );

        const session = (active || []).find(
            s => (s["mac-address"] || "").toLowerCase() === macAddress.toLowerCase()
        );

        if (session?.[".id"]) {
            await this.mikrotikClient.execute(
                router,
                "/ip/hotspot/active/remove",
                [`=.id=${session[".id"]}`]
            );
        }
    }

    async bindMac(router, { macAddress, wsnId }) {
        const existing = await this.mikrotikClient.execute(
            router,
            "/ip/hotspot/ip-binding/print",
            [`?mac-address=${macAddress}`]
        );

        if (existing?.length > 0) {
            console.log(`MAC binding exists: ${macAddress}`);
            return existing[0];
        }

        return this.mikrotikClient.execute(
            router,
            "/ip/hotspot/ip-binding/add",
            [
                `=mac-address=${macAddress}`,
                `=type=regular`,
                `=comment=${wsnId}`
            ]
        );
    }

    // ==================================================
    // USER MAC LINKING
    // ==================================================

    async setMacOnUser(router, { username, macAddress }) {
        const users = await this.mikrotikClient.execute(
            router,
            "/ip/hotspot/user/print",
            [`?name=${username}`]
        );

        if (!Array.isArray(users) || users.length === 0) {
            throw new Error(`Hotspot user not found: ${username}`);
        }

        return this.mikrotikClient.execute(router, "/ip/hotspot/user/set", [
            `=.id=${users[0][".id"]}`,
            `=mac-address=${macAddress}`
        ]);
    }

    // ==================================================
    // API LOGIN
    // ==================================================

   async apiLogin(router, { username, password, macAddress, ipAddress }) {
    // 1. IP address is absolutely mandatory for API login
    if (!ipAddress) {
        throw new Error("Cannot perform API login: Missing IP address.");
    }

    // Remove the host and active print calls to optimize speed during payment completion
    
    // 2. Strict MikroTik API parameter mapping
    const params = [
        `=user=${username}`,
        `=password=${password}`,
        `=ip=${ipAddress}`
    ];

    console.log("[API LOGIN] Sending parameters to MikroTik:", params);

    return this.mikrotikClient.execute(
        router,
        "/ip/hotspot/active/login",
        params
    );
}

    // ==================================================
    // ROUTER INFO
    // ==================================================

    async getRouterInfo(router) {
        const [identity, resource, addresses, hotspots] =
            await Promise.all([
                this.mikrotikClient.execute(router, "/system/identity/print", []),
                this.mikrotikClient.execute(router, "/system/resource/print", []),
                this.mikrotikClient.execute(router, "/ip/address/print", []),
                this.mikrotikClient.execute(router, "/ip/hotspot/print", [])
            ]);

        let hotspotIp = null;

        if (hotspots?.length) {
            const hotspotInterface = hotspots[0].interface;

            const hotspotAddress = addresses.find(
                a => a.interface === hotspotInterface
            );

            if (hotspotAddress?.address) {
                hotspotIp = hotspotAddress.address.split("/")[0];
            }
        }

        return {
            identity: identity?.[0]?.name,
            routerOsVersion: resource?.[0]?.version,
            routerBoard: resource?.[0]?.boardName,
            hotspotIp,
            addresses
        };
    }

    // ==================================================
    // MAIN FLOW
    // ==================================================

    async provisionAccess(router, { username, password, macAddress, ipAddress }) {
        if (macAddress) {
            await this.setMacOnUser(router, { username, macAddress });
        }

        if (macAddress) {
            try {
                await this.bindMac(router, { macAddress, wsnId: username });
            } catch (err) {
                if (!err.message?.includes("already exists")) {
                    console.warn("bindMac warning:", err.message);
                }
            }
        }

        try {
            console.log("[API LOGIN]", { username, macAddress, ipAddress });

            await this.apiLogin(router, {
                username,
                password,
                macAddress,
                ipAddress
            });

            return {
                success: true,
                method: "api-login",
                autoConnected: true
            };

        } catch (err) {
            console.warn("API login failed:", err.message);
        }

        await this.forceReconnect(router, macAddress);

        return {
            success: true,
            method: "mac-reconnect",
            autoConnected: false
        };
    }
}
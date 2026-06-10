// src/infrastructure/mikrotik/HotspotIntegration.js
import { mikrotikClient } from "../client/mikrotik.client.js";
import { formatUptime } from "../../../../shared/utils/formatUptime.js";

export class HotspotIntegration {

    // ==================================================
    // Account Lifecycle Management
    // ==================================================

    async createUser(router, account) {
        const params = [
            `=name=${account.wsnId}`,
            `=password=${account.routerPassword}`,
            `=profile=${account.routerProfile || "default"}`
        ];

        // Only if limitUptime is defined and > 0
        if (account.limitUptime && account.limitUptime > 0) {
            const uptime = formatUptime(Number(account.limitUptime));
            // console.log("limit uptime:", uptime);
            params.push(`=limit-uptime=${uptime}`);
        }

        return mikrotikClient.execute(
            router,
            "/ip/hotspot/user/add",
            params
        );
    }

    async changePassword(router, username, password) {
        return mikrotikClient.execute(router, "/ip/hotspot/user/set", [
            `=.id=[find name="${username}"]`,
            `=password=${password}`
        ]);
    }

    async suspendUser(router, wsnId) {
        return mikrotikClient.execute(router, "/ip/hotspot/user/set", [
            `=numbers=${wsnId}`,
            `=disabled=yes`
        ]);
    }

    async resumeUser(router, wsnId) {
        return mikrotikClient.execute(router, "/ip/hotspot/user/set", [
            `=numbers=${wsnId}`,
            `=disabled=no`
        ]);
    }

    async disconnectUser(router, wsnId) {
        return mikrotikClient.execute(router, "/ip/hotspot/active/remove", [
            `=user=${wsnId}`
        ]);
    }

    // ==================================================
    // Extensions
    // ==================================================

    async getProfiles(router) {
        return mikrotikClient.execute(
            router,
            "/ip/hotspot/user/profile/print",
            []
        );
    }

    async checkUserExists(router, wsnId) {
        const users = await mikrotikClient.execute(
            router,
            "/ip/hotspot/user/print",
            [`?name=${wsnId}`]
        );

        return Array.isArray(users) && users.length > 0;
    }

    async getActiveSessions(router) {
        return mikrotikClient.execute(
            router,
            "/ip/hotspot/active/print",
            []
        );
    }

    async getActiveUser(router, wsnId) {
        const res = await mikrotikClient.execute(
            router,
            "/ip/hotspot/active/print",
            [`?user=${wsnId}`]
        );

        return Array.isArray(res) ? res[0] : null;
    }

    async forceReconnect(router, macAddress) {
        if (!macAddress) return;

        const active = await mikrotikClient.execute(
            router,
            "/ip/hotspot/active/print"
        );

        const session = active.find(
            s =>
                (s["mac-address"] || "").toLowerCase() ===
                macAddress.toLowerCase()
        );

        if (session?.[".id"]) {
            await mikrotikClient.execute(
                router,
                "/ip/hotspot/active/remove",
                [`=.id=${session[".id"]}`]
            );
        }
    }

    async bindMac(router, { macAddress, wsnId }) {
        // Check if binding already exists
        const existing = await mikrotikClient.execute(
            router,
            "/ip/hotspot/ip-binding/print",
            [`?mac-address=${macAddress}`]
        );

        if (existing?.length > 0) {
            console.log(`MAC binding already exists for ${macAddress}, skipping`);
            return existing[0];
        }

        return mikrotikClient.execute(
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
    // NEW: Set MAC address directly on the hotspot user
    // This is what enables MAC-based auto-login on reconnect
    // ==================================================

    async setMacOnUser(router, { username, macAddress }) {
        const users = await mikrotikClient.execute(
            router,
            "/ip/hotspot/user/print",
            [`?name=${username}`]
        );

        if (!Array.isArray(users) || users.length === 0) {
            throw new Error(`Hotspot user not found: ${username}`);
        }

        return mikrotikClient.execute(
            router,
            "/ip/hotspot/user/set",
            [
                `=.id=${users[0][".id"]}`,
                `=mac-address=${macAddress}`
            ]
        );
    }

    
    
    async apiLogin(router, { username, password, macAddress, ipAddress }) {

        const params = [
            `=user=${username}`,
            `=password=${password}`,
            `=mac-address=${macAddress}`
        ];

        // Only add ip if we actually have it
        if (ipAddress && ipAddress !== "0.0.0.0") {
            params.push(`=ip=${ipAddress}`);
        }

        return mikrotikClient.execute(
            router,
            "/ip/hotspot/active/login",
            params
        );
    }


    // ==================================================
    // Router Info
    // ==================================================

    async getRouterInfo(router) {
        const [identity, resource, addresses, hotspots] =
            await Promise.all([
                mikrotikClient.execute(router, "/system/identity/print", []),
                mikrotikClient.execute(router, "/system/resource/print", []),
                mikrotikClient.execute(router, "/ip/address/print",      []),
                mikrotikClient.execute(router, "/ip/hotspot/print",      [])
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
            identity:        identity?.[0]?.name,
            routerOsVersion: resource?.[0]?.version,
            routerBoard:     resource?.[0]?.boardName,
            hotspotIp,
            addresses
        };
    }

    // ==================================================
    // Access Provisioning (MAIN FLOW) — updated
    // ==================================================

    async provisionAccess(router, { username, password, macAddress, ipAddress }) {

        // 1. Set MAC on hotspot user entry
        if (macAddress) {
            await this.setMacOnUser(router, { username, macAddress });
        }

        // 2. Bind MAC in ip-binding
        if (macAddress) {
            try {
                await this.bindMac(router, { macAddress, wsnId: username });
            } catch (err) {
                if (!err.message?.includes("already exists")) {
                    console.warn("bindMac warning:", err.message);
                }
            }
        }

        // 3. Try RouterOS API login — no ip argument
        try {
            await this.apiLogin(router, { username, password, macAddress });
            return {
                success:       true,
                method:        "api-login",
                autoConnected: true,
                message:       "User logged in via RouterOS API."
            };
        } catch (err) {
            console.warn("API login failed, falling back to MAC auth:", err.message);
        }

        // 4. Fallback — clear stale session, MAC auth on reconnect
        await this.forceReconnect(router, macAddress);

        return {
            success:       true,
            method:        "mac-reconnect",
            autoConnected: false,
            message:       "MAC bound. User will auto-login on reconnect."
        };
    }
}
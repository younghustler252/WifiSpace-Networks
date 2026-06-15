import { Account } from "../../domain/account.entity.js";

export class AccountMapper {

    // ==================================================
    // DOMAIN ← PERSISTENCE
    // ==================================================
    static toDomain(raw) {
        if (!raw) return null;

        const user = raw.userId;
        const isPopulated = user && typeof user === "object" && user._id;
        console.log("toDomain serviceType:", raw.serviceType); 

        return new Account({
            id: raw._id?.toString(),
            
            // ----------------------------
            // User
            // ----------------------------
            userId: isPopulated
                ? user._id.toString()
                : user?.toString(),

            user: isPopulated
                ? {
                    id: user._id.toString(),
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    avatar: user.avatar,
                }
                : null,

            // ----------------------------
            // Account Type
            // ----------------------------
            accountType: raw.accountType,

            businessName: raw.businessName ?? null,
            companyRegistrationNumber: raw.companyRegistrationNumber ?? null,
            taxId: raw.taxId ?? null,
            // ----------------------------
            // Network
            // ----------------------------
            wsnId: raw.wsnId,
            routerPassword: raw.routerPassword,

            routerId: raw.routerId,
            routerProfile: raw.routerProfile,

            // ✅ FIXED
            devices: Array.isArray(raw.devices)
                ? raw.devices.map(d => ({
                    macAddress: d.macAddress?.toUpperCase(),
                    hostname: d.hostname ?? null,
                    lastSeenAt: d.lastSeenAt ?? null
                }))
                : [],

            // ----------------------------
            // Service
            // ----------------------------
            serviceType: raw.serviceType,
            profileStatus: raw.profileStatus,
            

            // ----------------------------
            // Monitoring
            // ----------------------------
            limitUptime: raw.limitUptime,

            // ----------------------------
            // Provisioning (SAFE DEFAULT)
            // ----------------------------
            routerProvision: {
                status: raw.routerProvision?.status ?? "pending",
                lastError: raw.routerProvision?.lastError ?? null,
                lastAttemptAt: raw.routerProvision?.lastAttemptAt ?? null
            },

            // ----------------------------
            // timestamps
            // ----------------------------
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt
        });
    }

    // ==================================================
    // DOMAIN → PERSISTENCE
    // ==================================================
    static toPersistence(account) {
        return {
            userId: account.userId,

            accountType: account.accountType,

            businessName: account.businessName ?? null,
            companyRegistrationNumber: account.companyRegistrationNumber ?? null,
            taxId: account.taxId ?? null,

            wsnId: account.wsnId,
            routerPassword: account.routerPassword,

            routerId: account.routerId,
            routerProfile: account.routerProfile,

            // ----------------------------
            // Devices (NORMALIZED)
            // ----------------------------
            devices: Array.isArray(account.devices)
                ? account.devices.map(d => ({
                    macAddress: d.macAddress?.toUpperCase(),
                    hostname: d.hostname ?? null,
                    lastSeenAt: d.lastSeenAt ?? null
                }))
                : [],

            serviceType: account.serviceType,
            profileStatus: account.profileStatus,

            limitUptime: account.limitUptime,

            routerProvision: account.routerProvision
        };
    }
}
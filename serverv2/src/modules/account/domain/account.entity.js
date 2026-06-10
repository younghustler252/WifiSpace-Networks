import {
    ACCOUNT_TYPES,
    ACCOUNT_TYPE_LIST,
    PROFILE_STATUSES,
    PROFILE_STATUS_LIST,
    SERVICE_TYPES,
    SERVICE_TYPE_LIST
} from "./account.enum.js";

export class Account {
    constructor({
        id,
        userId,
        user = null,

        accountType = ACCOUNT_TYPES.PERSONAL,

        businessName = null,
        companyRegistrationNumber = null,
        taxId = null,

        wsnId,
        routerPassword = null,

        routerId = null,
        routerProfile = "default",

        // ✅ FIXED: matches schema devices[]
        devices = [],

        serviceType = SERVICE_TYPES.PPPOE,
        profileStatus = PROFILE_STATUSES.PENDING,

        limitUptime = "0",

        routerProvision = {
            status: "pending",
            lastError: null,
            lastAttemptAt: null
        },

        createdAt = null,
        updatedAt = null
    }) {

        // ----------------------------
        // Validation
        // ----------------------------
        if (!userId) throw new Error("User ID is required");
        // if (!wsnId) throw new Error("WSN ID is required");

        if (!ACCOUNT_TYPE_LIST.includes(accountType)) {
            throw new Error("Invalid account type");
        }

        if (!PROFILE_STATUS_LIST.includes(profileStatus)) {
            throw new Error("Invalid profile status");
        }

        if (!SERVICE_TYPE_LIST.includes(serviceType)) {
            throw new Error("Invalid service type");
        }

        // ----------------------------
        // Identity
        // ----------------------------
        this.id = id;
        this.userId = userId;
        this.user = user;

        // ----------------------------
        // Account Type
        // ----------------------------
        this.accountType = accountType;

        this.businessName =
            accountType === ACCOUNT_TYPES.BUSINESS ? businessName : null;

        this.companyRegistrationNumber =
            accountType === ACCOUNT_TYPES.BUSINESS ? companyRegistrationNumber : null;

        this.taxId =
            accountType === ACCOUNT_TYPES.BUSINESS ? taxId : null;

        // ----------------------------
        // Network Identity
        // ----------------------------
        this.wsnId = wsnId;
        this.routerPassword = routerPassword;

        this.routerId = routerId;
        this.routerProfile = routerProfile;

        // ✅ FIXED: schema uses devices[]
        this.devices = devices;

        // ----------------------------
        // Service
        // ----------------------------
        this.serviceType = serviceType;
        this.profileStatus = profileStatus;

        // ----------------------------
        // Monitoring
        // ----------------------------
        this.limitUptime = limitUptime;

        // ----------------------------
        // Router Provisioning
        // ----------------------------
        this.routerProvision = {
            status: routerProvision?.status || "pending",
            lastError: routerProvision?.lastError || null,
            lastAttemptAt: routerProvision?.lastAttemptAt || null
        };

        // ----------------------------
        // Timestamps
        // ----------------------------
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // ==================================================
    // Helpers
    // ==================================================

    isBusinessAccount() {
        return this.accountType === ACCOUNT_TYPES.BUSINESS;
    }

    isPersonalAccount() {
        return this.accountType === ACCOUNT_TYPES.PERSONAL;
    }

    isActive() {
        return this.profileStatus === PROFILE_STATUSES.ACTIVE;
    }

    // ==================================================
    // Profile State
    // ==================================================

    activateProfile() {
        this.profileStatus = PROFILE_STATUSES.ACTIVE;
    }

    suspendProfile() {
        this.profileStatus = PROFILE_STATUSES.SUSPENDED;
    }

    cancelProfile() {
        this.profileStatus = PROFILE_STATUSES.CANCELED;
    }

    // ==================================================
    // Router Provisioning
    // ==================================================

    markProvisionSynced() {
        this.routerProvision.status = "synced";
        this.routerProvision.lastError = null;
        this.routerProvision.lastAttemptAt = new Date();
    }

    markProvisionFailed(error) {
        this.routerProvision.status = "failed";
        this.routerProvision.lastError = error;
        this.routerProvision.lastAttemptAt = new Date();
    }

    markProvisionPending() {
        this.routerProvision.status = "pending";
    }

    // ==================================================
    // Router Updates
    // ==================================================

    updateRouterPassword(newPassword) {
        if (!newPassword) throw new Error("Password cannot be empty");
        this.routerPassword = newPassword;
    }

    updateRouterProfile(newProfile) {
        if (!newProfile) throw new Error("Router profile cannot be empty");
        this.routerProfile = newProfile;
    }

    moveToRouter(newRouterId) {
        if (!newRouterId) throw new Error("Router ID is required");
        this.routerId = newRouterId;
    }

    // ==================================================
    // Device Tracking (FIXED for schema)
    // ==================================================

    addDevice({ macAddress, hostname = null }) {
        if (!macAddress) throw new Error("MAC address required");

        this.devices.push({
            macAddress: macAddress.toUpperCase(),
            hostname,
            lastSeenAt: new Date()
        });
    }

    updateDeviceLastSeen(macAddress, date = new Date()) {
        const device = this.devices.find(
            d => d.macAddress === macAddress.toUpperCase()
        );

        if (device) {
            device.lastSeenAt = date;
        }
    }

    removeDevice(macAddress) {
        this.devices = this.devices.filter(
            d => d.macAddress !== macAddress.toUpperCase()
        );
    }

    // ==================================================
    // Serialization
    // ==================================================

    toJSON() {
        const obj = { ...this };
        delete obj.routerPassword;
        return obj;
    }
}
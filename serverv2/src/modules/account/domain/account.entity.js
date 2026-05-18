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

        routerId,
        routerProfile = "default",
        macAddress = null,

        serviceType = SERVICE_TYPES.PPPOE,
        profileStatus = PROFILE_STATUSES.PENDING,

        limitUptime = "0",
        lastSeenAt = null,
        mikrotikUserCreated = false,
    }) {

        // ----------------------------
        // Required Fields Validation
        // ----------------------------
        if (!userId) throw new Error("User ID is required");
        // if (!wsnId) throw new Error("WSN ID is required");
        // if (!routerId) throw new Error("Router ID is required");

        // ----------------------------
        // Enum Validation
        // ----------------------------
        if (!ACCOUNT_TYPE_LIST.includes(accountType)) throw new Error("Invalid account type");
        if (!PROFILE_STATUS_LIST.includes(profileStatus)) throw new Error("Invalid profile status");
        if (!SERVICE_TYPE_LIST.includes(serviceType)) throw new Error("Invalid service type");

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

        this.businessName = accountType === ACCOUNT_TYPES.BUSINESS ? businessName : null;
        this.companyRegistrationNumber = accountType === ACCOUNT_TYPES.BUSINESS ? companyRegistrationNumber : null;
        this.taxId = accountType === ACCOUNT_TYPES.BUSINESS ? taxId : null;

        // ----------------------------
        // Network Identity
        // ----------------------------
        this.wsnId = wsnId;
        this.routerPassword = routerPassword;
        this.routerId = routerId;
        this.routerProfile = routerProfile;
        this.macAddress = macAddress;

        // ----------------------------
        // Service Info
        // ----------------------------
        this.serviceType = serviceType;
        this.profileStatus = profileStatus;

        // ----------------------------
        // Monitoring
        // ----------------------------
        this.limitUptime = limitUptime;
        this.lastSeenAt = lastSeenAt;
        this.mikrotikUserCreated = mikrotikUserCreated;

    }

    // ----------------------------
    // Account Type Helpers
    // ----------------------------
    isBusinessAccount() {
        return this.accountType === ACCOUNT_TYPES.BUSINESS;
    }

    isPersonalAccount() {
        return this.accountType === ACCOUNT_TYPES.PERSONAL;
    }

    // ----------------------------
    // Business Validation
    // ----------------------------
    isBusinessComplete() {
        if (!this.isBusinessAccount()) return true;
        return Boolean(this.businessName && this.companyRegistrationNumber && this.taxId);
    }

    needsBusinessVerification() {
        return this.isBusinessAccount() && !this.isBusinessComplete();
    }

    // ----------------------------
    // Profile Status Management
    // ----------------------------
    activateProfile() {
        if (this.profileStatus === PROFILE_STATUSES.ACTIVE) throw new Error("Account already active");
        this.profileStatus = PROFILE_STATUSES.ACTIVE;
    }

    suspendProfile() {
        if (this.profileStatus !== PROFILE_STATUSES.ACTIVE) throw new Error("Only active accounts can be suspended");
        this.profileStatus = PROFILE_STATUSES.SUSPENDED;
    }

    cancelProfile() {
        this.profileStatus = PROFILE_STATUSES.CANCELED;
    }

    isActive() {
        return this.profileStatus === PROFILE_STATUSES.ACTIVE;
    }

    // ----------------------------
    // Router / PPPoE Management
    // ----------------------------
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

    // ----------------------------
    // Monitoring
    // ----------------------------
    updateLastSeen(date = new Date()) {
        this.lastSeenAt = date;
    }

    // ----------------------------
    // JSON Transformation
    // ----------------------------
    toJSON() {
        const obj = { ...this };
        delete obj.routerPassword; // hide sensitive
        return obj;
    }
}
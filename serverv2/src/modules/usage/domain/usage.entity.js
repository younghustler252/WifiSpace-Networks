// usage-snapshot.entity.js

export class UsageSnapshot {
    constructor({
        id,

        accountId,
        routerId,

        wsnId,

        online = false,

        ipAddress = null,
        macAddress = null,

        uptime = "0s",

        downloadBytes = 0,
        uploadBytes = 0,

        lastSeenAt = null,

        createdAt = null,
        updatedAt = null
    }) {

        if (!accountId) {
            throw new Error("Account ID is required");
        }

        if (!routerId) {
            throw new Error("Router ID is required");
        }

        if (!wsnId) {
            throw new Error("WSN ID is required");
        }

        this.id = id;

        this.accountId = accountId;
        this.routerId = routerId;

        this.wsnId = wsnId;

        this.online = online;

        this.ipAddress = ipAddress;
        this.macAddress = macAddress;

        this.uptime = uptime;

        this.downloadBytes = downloadBytes;
        this.uploadBytes = uploadBytes;

        this.lastSeenAt = lastSeenAt;

        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // ============================================
    // State
    // ============================================

    markOnline({
        ipAddress = null,
        macAddress = null,
        uptime = "0s"
    }) {
        this.online = true;

        this.ipAddress = ipAddress;
        this.macAddress = macAddress;

        this.uptime = uptime;
        this.lastSeenAt = new Date();
    }

    markOffline() {
        this.online = false;
        this.lastSeenAt = new Date();
    }

    // ============================================
    // Traffic
    // ============================================

    updateTraffic({
        downloadBytes = 0,
        uploadBytes = 0
    }) {
        this.downloadBytes = downloadBytes;
        this.uploadBytes = uploadBytes;
    }

    // ============================================
    // Helpers
    // ============================================

    getTotalBytes() {
        return this.downloadBytes + this.uploadBytes;
    }

    hasTraffic() {
        return this.getTotalBytes() > 0;
    }

    isOnline() {
        return this.online;
    }

    // ============================================
    // Serialization
    // ============================================

    toJSON() {
        return {
            id: this.id,

            accountId: this.accountId,
            routerId: this.routerId,

            wsnId: this.wsnId,

            online: this.online,

            ipAddress: this.ipAddress,
            macAddress: this.macAddress,

            uptime: this.uptime,

            downloadBytes: this.downloadBytes,
            uploadBytes: this.uploadBytes,

            totalBytes: this.getTotalBytes(),

            lastSeenAt: this.lastSeenAt,

            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}
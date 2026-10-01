import { HOTSPOT_SESSION_STATUSES, HOTSPOT_SESSION_STATUS_LIST } from "./hotspot-session.enum.js";
import { ValidationError } from "../../../shared/errors/domain.errors.js";

export class HotspotSession {
	constructor({
		id, userId = null, accountId = null, routerId, macAddress, ipAddress = null, userAgent = null,
		status = HOTSPOT_SESSION_STATUSES.PENDING, trustedDevice = false,
		lastSeenAt = new Date(), expiresAt = null, createdAt = null, updatedAt = null
	}) {
		if (!routerId) throw new ValidationError("Router ID is required");
		if (!macAddress) throw new ValidationError("MAC address is required");
		if (!HOTSPOT_SESSION_STATUS_LIST.includes(status)) throw new ValidationError("Invalid session status");

		this.id = id;
		this.userId = userId;
		this.accountId = accountId;
		this.routerId = routerId;
		this.macAddress = macAddress.toUpperCase();
		this.ipAddress = ipAddress;
		this.userAgent = userAgent;
		this.status = status;
		this.trustedDevice = trustedDevice;
		this.lastSeenAt = lastSeenAt;
		this.expiresAt = expiresAt;
		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
	}

	isAuthenticated() { return this.status === HOTSPOT_SESSION_STATUSES.AUTHENTICATED; }
	isExpired() { return this.status === HOTSPOT_SESSION_STATUSES.EXPIRED || (this.expiresAt && new Date() > new Date(this.expiresAt)); }
	isRevoked() { return this.status === HOTSPOT_SESSION_STATUSES.REVOKED; }
	isTrustedFor(userId) { return this.isAuthenticated() && !this.isExpired() && String(this.userId) === String(userId); }

	authenticate({ userId, accountId, routerId, ipAddress = null, userAgent = null, expiresAt = null }) {
		this.userId = userId;
		this.accountId = accountId;
		this.routerId = routerId;
		if (ipAddress) this.ipAddress = ipAddress;
		if (userAgent) this.userAgent = userAgent;
		this.status = HOTSPOT_SESSION_STATUSES.AUTHENTICATED;
		this.trustedDevice = true;
		this.lastSeenAt = new Date();
		this.expiresAt = expiresAt;
	}

	refresh(expiresAt = null) {
		this.lastSeenAt = new Date();
		if (expiresAt) this.expiresAt = expiresAt;
	}

	expire() { this.status = HOTSPOT_SESSION_STATUSES.EXPIRED; }
	revoke() {
		this.status = HOTSPOT_SESSION_STATUSES.REVOKED;
		this.trustedDevice = false;
	}

	toJSON() { return { ...this }; }
}
import {
	ROUTER_TYPES,
	ROUTER_STATUSES,
} from "./router.enum.js";

export class RouterEntity {
	constructor({
		id = null,

		name,
		code,

		host,
		port = 8728,

		username,
		password,

		ssl = false,

		routerType = ROUTER_TYPES.PPPOE,

		location = null,
		popName = null,

		status = ROUTER_STATUSES.OFFLINE,

		isEnabled = true,

		lastSeenAt = null,
		lastProvisionSyncAt = null,

		maxSessions = 0,
		currentSessions = 0,

		routerOsVersion = null,
		routerBoard = null,
		systemIdentity = null,

		priority = 1,
		isDefaultRouter = false,

		apiEnabled = true,

		lastError = null,

		createdAt = null,
		updatedAt = null,
	}) {
		// ----------------------------
		// Identity
		// ----------------------------

		this.id = id;

		this.name = name;
		this.code = code;

		// ----------------------------
		// Access
		// ----------------------------

		this.host = host;
		this.port = port;

		this.username = username;
		this.password = password;

		this.ssl = ssl;

		// ----------------------------
		// Capability
		// ----------------------------

		this.routerType = routerType;

		// ----------------------------
		// Location
		// ----------------------------

		this.location = location;
		this.popName = popName;

		// ----------------------------
		// Status
		// ----------------------------

		this.status = status;

		this.isEnabled = isEnabled;

		this.lastSeenAt = lastSeenAt;

		this.lastProvisionSyncAt =
			lastProvisionSyncAt;

		// ----------------------------
		// Capacity
		// ----------------------------

		this.maxSessions = maxSessions;

		this.currentSessions = currentSessions;

		// ----------------------------
		// Router Metadata
		// ----------------------------

		this.routerOsVersion =
			routerOsVersion;

		this.routerBoard = routerBoard;

		this.systemIdentity =
			systemIdentity;

		// ----------------------------
		// Priority
		// ----------------------------

		this.priority = priority;

		this.isDefaultRouter =
			isDefaultRouter;

		// ----------------------------
		// API
		// ----------------------------

		this.apiEnabled = apiEnabled;

		// ----------------------------
		// Error Tracking
		// ----------------------------

		this.lastError = lastError;

		// ----------------------------
		// Timestamps
		// ----------------------------

		this.createdAt = createdAt;

		this.updatedAt = updatedAt;
	}

	// ==================================================
	// Business Rules
	// ==================================================

	isOnline() {
		return (
			this.status ===
			ROUTER_STATUSES.ONLINE
		);
	}

	isOffline() {
		return (
			this.status ===
			ROUTER_STATUSES.OFFLINE
		);
	}

	isHotspotRouter() {
		return (
			this.routerType ===
				ROUTER_TYPES.HOTSPOT ||
			this.routerType ===
				ROUTER_TYPES.MIXED
		);
	}

	isPPPoERouter() {
		return (
			this.routerType ===
				ROUTER_TYPES.PPPOE ||
			this.routerType ===
				ROUTER_TYPES.MIXED
		);
	}

	canProvision() {
		return (
			this.isEnabled &&
			this.apiEnabled &&
			this.isOnline()
		);
	}

	hasCapacity() {
		if (this.maxSessions === 0) {
			return true;
		}

		return (
			this.currentSessions <
			this.maxSessions
		);
	}

	markOnline() {
		this.status =
			ROUTER_STATUSES.ONLINE;

		this.lastSeenAt = new Date();

		this.lastError = null;
	}

	markOffline(error = null) {
		this.status =
			ROUTER_STATUSES.OFFLINE;

		this.lastError = error;
	}

	incrementSessions() {
		this.currentSessions += 1;
	}

	decrementSessions() {
		if (this.currentSessions > 0) {
			this.currentSessions -= 1;
		}
	}
}
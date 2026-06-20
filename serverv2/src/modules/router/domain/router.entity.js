import { ROUTER_STATUSES } from "./router.enum.js";
import { ROUTER_CONNECTION_TYPES } from "./router.enum.js";

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

		routerUid = null,

		supportedServices = [],

		location = null,
		siteCode = null,
		popName = null,

		status = ROUTER_STATUSES.OFFLINE,

		isEnabled = true,
		apiEnabled = true,

		lastSeenAt = null,
		lastProvisionSyncAt = null,

		connectionType = ROUTER_CONNECTION_TYPES.DIRECT,
		connectorId = null,

		maxSessions = 0,
		currentSessions = 0,

		agentLastSeenAt = null,
		agentStatus = "offline",

		routerOsVersion = null,
		routerBoard = null,
		systemIdentity = null,

		priority = 1,
		isDefaultRouter = false,

		lastError = null,

		createdAt = null,
		updatedAt = null,
	}) {
		// Identity
		this.id = id;
		this.name = name;
		this.code = code;

		// Access
		this.routerUid = routerUid;
		this.host = host;
		this.port = port;
		this.username = username;
		this.password = password;
		this.ssl = ssl;

		// Capability (FIXED)
		this.supportedServices = supportedServices;

		// Status
		this.status = status;
		this.isEnabled = isEnabled;
		this.apiEnabled = apiEnabled;

		this.lastSeenAt = lastSeenAt;
		this.lastProvisionSyncAt = lastProvisionSyncAt;

		// Capacity
		this.maxSessions = maxSessions;
		this.currentSessions = currentSessions;

		// Metadata
		this.routerOsVersion = routerOsVersion;
		this.routerBoard = routerBoard;
		this.systemIdentity = systemIdentity;

		// Location
		this.location = location;
		this.siteCode = siteCode;
		this.popName = popName;

		// Connection
		this.connectionType = connectionType;
		this.connectorId = connectorId;

		// Agent
		this.agentLastSeenAt = agentLastSeenAt;
		this.agentStatus = agentStatus;

		// Priority
		this.priority = priority;
		this.isDefaultRouter = isDefaultRouter;

		// Errors
		this.lastError = lastError;

		// Timestamps
		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
	}

	// ==================================================
	// Business Rules
	// ==================================================

	isOnline() {
		return this.status === ROUTER_STATUSES.ONLINE;
	}

	isOffline() {
		return this.status === ROUTER_STATUSES.OFFLINE;
	}

	isHotspotRouter() {
		return this.supportedServices.includes("hotspot");
	}

	isPPPoERouter() {
		return this.supportedServices.includes("pppoe");
	}

	canProvision() {
		if (!this.isEnabled) return false;

		if (!this.apiEnabled) return false;

		if (!this.isOnline()) return false;

		if (this.isAgentConnection()) {
			return this.isAgentOnline();
		}

		return true;
	}

	hasCapacity() {
		if (this.maxSessions === 0) return true;
		return this.currentSessions < this.maxSessions;
	}

	markOnline() {
		this.status = ROUTER_STATUSES.ONLINE;
		this.lastSeenAt = new Date();
		this.lastError = null;
	}

	markOffline(error = null) {
		this.status = ROUTER_STATUSES.OFFLINE;
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
	isDirectConnection() {
	return this.connectionType ===  ROUTER_CONNECTION_TYPES.DIRECT;
}

	isAgentConnection() {
		return this.connectionType === ROUTER_CONNECTION_TYPES.AGENT;
	}

	isVpnConnection() {
		return this.connectionType === ROUTER_CONNECTION_TYPES.VPN;
	}
	isAgentOnline() {
		return this.agentStatus === ROUTER_AGENT_STATUSES.ONLINE;
	}

	isAgentOffline() {
		return this.agentStatus === ROUTER_AGENT_STATUSES.OFFLINE;
	}
	markAgentOnline() {
		this.agentStatus = ROUTER_AGENT_STATUSES.ONLINE;
		this.agentLastSeenAt = new Date();
	}

	markAgentOffline() {
		this.agentStatus = ROUTER_AGENT_STATUSES.OFFLINE;
	}
	requiresAgent() {
		return this.connectionType === ROUTER_CONNECTION_TYPES.AGENT;
	}
}
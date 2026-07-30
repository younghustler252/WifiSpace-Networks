import { ROUTER_STATUSES, ROUTER_CONNECTION_TYPES, ROUTER_AGENT_STATUSES } from "./router.enum.js"; // CHANGED: added ROUTER_AGENT_STATUSES — the missing import that was crashing every agent-connection router

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
		// REMOVED: connectorId — confirmed unused, dropped from the schema too.

		maxSessions = 0,
		currentSessions = 0,

		agentLastSeenAt = null,
		agentStatus = ROUTER_AGENT_STATUSES.OFFLINE, // CHANGED: was a bare "offline" string

		routerOsVersion = null,
		routerBoard = null,
		systemIdentity = null,

		priority = 1,
		isDefaultRouter = false,

		lastError = null,

		createdAt = null,
		updatedAt = null,
	}) {
		this.id = id;
		this.name = name;
		this.code = code;

		this.routerUid = routerUid;
		this.host = host;
		this.port = port;
		this.username = username;
		this.password = password;
		this.ssl = ssl;

		this.supportedServices = supportedServices;

		this.status = status;
		this.isEnabled = isEnabled;
		this.apiEnabled = apiEnabled;

		this.lastSeenAt = lastSeenAt;
		this.lastProvisionSyncAt = lastProvisionSyncAt;

		this.maxSessions = maxSessions;
		this.currentSessions = currentSessions;

		this.routerOsVersion = routerOsVersion;
		this.routerBoard = routerBoard;
		this.systemIdentity = systemIdentity;

		this.location = location;
		this.siteCode = siteCode;
		this.popName = popName;

		this.connectionType = connectionType;
		// REMOVED: this.connectorId

		this.agentLastSeenAt = agentLastSeenAt;
		this.agentStatus = agentStatus;

		this.priority = priority;
		this.isDefaultRouter = isDefaultRouter;

		this.lastError = lastError;

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
		return this.connectionType === ROUTER_CONNECTION_TYPES.DIRECT;
	}

	isAgentConnection() {
		return this.connectionType === ROUTER_CONNECTION_TYPES.AGENT;
	}

	isVpnConnection() {
		return this.connectionType === ROUTER_CONNECTION_TYPES.VPN;
	}

	isAgentOnline() {
		return this.agentStatus === ROUTER_AGENT_STATUSES.ONLINE; // CHANGED: this line was the crash — ROUTER_AGENT_STATUSES now actually exists
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
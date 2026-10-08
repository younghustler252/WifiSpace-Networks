import { ROUTER_STATUSES, ROUTER_STATUS_LIST, CONNECTION_TYPES, CONNECTION_TYPE_LIST, SERVICE_TYPE_LIST, ROUTER_ERROR_TYPES } from "./router.enum.js";
import { ValidationError } from "../../../shared/errors/domain.errors.js";

export class Router {
	constructor({
		id, name, code, host, port = 8728, username, password = null,
		ssl = false, routerUid = null,
		supportedServices = [],
		location = null, siteCode = null, popName = null,
		status = ROUTER_STATUSES.OFFLINE, lastError = null, lastErrorType = null,
		isEnabled = true, apiEnabled = true,
		lastSeenAt = null, lastProvisionSyncAt = null,
		connectionType = CONNECTION_TYPES.DIRECT, connectorId = null,
		maxSessions = 0, currentSessions = 0,
		routerOsVersion = null, routerBoard = null, systemIdentity = null,
		priority = 1, isDefaultRouter = false,
		deletedAt = null, createdAt = null, updatedAt = null
	}) {
		if (!name) throw new ValidationError("Router name is required");
		if (!host) throw new ValidationError("Router host is required");
		if (!username) throw new ValidationError("Router username is required");
		if (!ROUTER_STATUS_LIST.includes(status)) throw new ValidationError("Invalid router status");
		if (!CONNECTION_TYPE_LIST.includes(connectionType)) throw new ValidationError("Invalid connection type");
		if (supportedServices.some((s) => !SERVICE_TYPE_LIST.includes(s))) {
			throw new ValidationError("Invalid service type in supportedServices");
		}
		if (lastErrorType && !Object.values(ROUTER_ERROR_TYPES).includes(lastErrorType)) {
			throw new ValidationError("Invalid router error type");
		}

		Object.assign(this, {
			id, name, code, host, port, username, password, ssl, routerUid,
			supportedServices, location, siteCode, popName, status, lastError, lastErrorType,
			isEnabled, apiEnabled, lastSeenAt, lastProvisionSyncAt,
			connectionType, connectorId, maxSessions, currentSessions,
			routerOsVersion, routerBoard, systemIdentity,
			priority, isDefaultRouter, deletedAt, createdAt, updatedAt
		});
	}

	isOnline() {
		return this.status === ROUTER_STATUSES.ONLINE;
	}

	isAtCapacity() {
		return this.maxSessions > 0 && this.currentSessions >= this.maxSessions;
	}

	supports(serviceType) {
		return this.supportedServices.includes(serviceType);
	}

	isDeleted() {
		return this.deletedAt !== null;
	}

	markOnline(info = {}) {
		this.status = ROUTER_STATUSES.ONLINE;
		this.lastError = null;
		this.lastErrorType = null;
		this.lastSeenAt = new Date();

		if (info.identity) this.systemIdentity = info.identity;
		if (info.version) this.routerOsVersion = info.version;
		if (info.board) this.routerBoard = info.board;
	}

	markOffline(error = null, errorType = ROUTER_ERROR_TYPES.UNKNOWN) {
		this.status = ROUTER_STATUSES.OFFLINE;
		this.lastError = error;
		this.lastErrorType = errorType;
	}

	toJSON() {
		const obj = { ...this };
		delete obj.password;

		if (this.isOnline()) {
			obj.hostReachable = true;
		} else if ([ROUTER_ERROR_TYPES.AUTH_FAILED, ROUTER_ERROR_TYPES.CONNECTION_REFUSED].includes(this.lastErrorType)) {
			obj.hostReachable = true;
		} else {
			obj.hostReachable = null;
		}

		return obj;
	}
}

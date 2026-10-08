import { SERVICE_TYPES, SERVICE_TYPE_LIST } from "../../../shared/constants/service-type.enum.js";
export { SERVICE_TYPES, SERVICE_TYPE_LIST };

export const ROUTER_STATUSES = { ONLINE: "online", OFFLINE: "offline", MAINTENANCE: "maintenance" };
export const ROUTER_STATUS_LIST = Object.values(ROUTER_STATUSES);

export const CONNECTION_TYPES = { DIRECT: "direct", VPN: "vpn" };
export const CONNECTION_TYPE_LIST = Object.values(CONNECTION_TYPES);

export const ROUTER_ERROR_TYPES = {
	AUTH_FAILED: "auth_failed",
	CONNECTION_REFUSED: "connection_refused",
	TIMEOUT: "timeout",
	HOST_UNREACHABLE: "host_unreachable",
	CREDENTIALS_MISSING: "credentials_missing",
	UNKNOWN: "unknown"
};
export const ROUTER_ERROR_TYPE_LIST = Object.values(ROUTER_ERROR_TYPES);

export const ROUTER_ERROR_CODES = {
	ROUTER_NOT_FOUND: "ROUTER_NOT_FOUND",
	ROUTER_CODE_CONFLICT: "ROUTER_CODE_CONFLICT",
	NO_AVAILABLE_ROUTER: "NO_AVAILABLE_ROUTER",
	ROUTER_OFFLINE: "ROUTER_OFFLINE"
};
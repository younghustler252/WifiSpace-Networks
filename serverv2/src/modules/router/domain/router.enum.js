import { SERVICE_TYPES, SERVICE_TYPE_LIST } from "../../../shared/constants/service-type.enum.js";
export { SERVICE_TYPES, SERVICE_TYPE_LIST };

export const ROUTER_STATUSES = { ONLINE: "online", OFFLINE: "offline", MAINTENANCE: "maintenance" };
export const ROUTER_STATUS_LIST = Object.values(ROUTER_STATUSES);

export const CONNECTION_TYPES = { DIRECT: "direct", AGENT: "agent", VPN: "vpn" };
export const CONNECTION_TYPE_LIST = Object.values(CONNECTION_TYPES);

export const AGENT_STATUSES = { ONLINE: "online", OFFLINE: "offline" };
export const AGENT_STATUS_LIST = Object.values(AGENT_STATUSES);

export const ROUTER_ERROR_CODES = {
	ROUTER_NOT_FOUND: "ROUTER_NOT_FOUND",
	ROUTER_CODE_CONFLICT: "ROUTER_CODE_CONFLICT",
	NO_AVAILABLE_ROUTER: "NO_AVAILABLE_ROUTER",
	ROUTER_OFFLINE: "ROUTER_OFFLINE"
};
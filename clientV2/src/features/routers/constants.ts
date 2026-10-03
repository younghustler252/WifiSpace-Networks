export const ROUTER_STATUS = { ONLINE: "online", OFFLINE: "offline", MAINTENANCE: "maintenance" } as const;

export const CONNECTION_TYPE_OPTIONS = [
	{ value: "direct", label: "Direct" },
	{ value: "agent", label: "Agent" },
	{ value: "vpn", label: "VPN" },
] as const;

export const ROUTER_ERROR_CODES = {
	ROUTER_NOT_FOUND: "ROUTER_NOT_FOUND",
	ROUTER_CODE_CONFLICT: "ROUTER_CODE_CONFLICT",
	NO_AVAILABLE_ROUTER: "NO_AVAILABLE_ROUTER",
	ROUTER_OFFLINE: "ROUTER_OFFLINE",
} as const;

export const ROUTER_ERROR_MESSAGES: Record<string, string> = {
	[ROUTER_ERROR_CODES.ROUTER_NOT_FOUND]: "That router no longer exists. Refresh and try again.",
	[ROUTER_ERROR_CODES.ROUTER_CODE_CONFLICT]: "A router with that code already exists.",
	[ROUTER_ERROR_CODES.NO_AVAILABLE_ROUTER]: "No router is available for this service right now.",
	[ROUTER_ERROR_CODES.ROUTER_OFFLINE]: "That router is offline. Try again once it's back online.",
};
export const NETWORK_ERROR_CODES = {
	HOTSPOT_PROFILE_NAME_CONFLICT: "HOTSPOT_PROFILE_NAME_CONFLICT",
	HOTSPOT_PROFILE_NOT_FOUND: "HOTSPOT_PROFILE_NOT_FOUND",
	HOTSPOT_PROFILE_IN_USE: "HOTSPOT_PROFILE_IN_USE",
	HOTSPOT_PROFILE_UNKNOWN: "HOTSPOT_PROFILE_UNKNOWN",
	WALLED_GARDEN_CONFLICT: "WALLED_GARDEN_CONFLICT",
	WALLED_GARDEN_NOT_FOUND: "WALLED_GARDEN_NOT_FOUND",
	SYNC_NEEDS_ROUTER: "SYNC_NEEDS_ROUTER",
} as const;

export const NETWORK_ERROR_MESSAGES: Record<string, string> = {
	[NETWORK_ERROR_CODES.HOTSPOT_PROFILE_NAME_CONFLICT]: "A profile with that name already exists.",
	[NETWORK_ERROR_CODES.HOTSPOT_PROFILE_NOT_FOUND]: "That profile no longer exists. Refresh and try again.",
	[NETWORK_ERROR_CODES.WALLED_GARDEN_CONFLICT]: "An identical walled garden entry already exists.",
	[NETWORK_ERROR_CODES.WALLED_GARDEN_NOT_FOUND]: "That entry no longer exists. Refresh and try again.",
	[NETWORK_ERROR_CODES.SYNC_NEEDS_ROUTER]: "Choose a router to preview changes.",
};

export const SYNC_STATUS_LABEL: Record<string, string> = {
	synced: "Synced",
	partial: "Partly synced",
	failed: "Failed",
	never: "Not synced yet",
};

export const OPEN_STATUS_PAGE_OPTIONS = [
	{ value: "always", label: "Always" },
	{ value: "http-login", label: "On HTTP login" },
	{ value: "not-http", label: "Not on HTTP" },
] as const;

export const HOST_ACTIONS = [
	{ value: "allow", label: "Allow" },
	{ value: "deny", label: "Deny" },
] as const;

export const IP_ACTIONS = [
	{ value: "accept", label: "Accept" },
	{ value: "drop", label: "Drop" },
	{ value: "reject", label: "Reject" },
] as const;

export const PROTOCOL_OPTIONS = [
	{ value: "tcp", label: "TCP" },
	{ value: "udp", label: "UDP" },
	{ value: "icmp", label: "ICMP" },
] as const;

export const PROFILE_NAME_PATTERN = /^[A-Za-z0-9 ._-]{1,40}$/;
export const DURATION_PATTERN = /^(\d+[smhdw])+$/;

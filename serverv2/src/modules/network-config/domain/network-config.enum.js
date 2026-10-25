export const RESOURCE_TYPES = { HOTSPOT_PROFILE: "hotspot_profile", WALLED_GARDEN: "walled_garden" };
export const RESOURCE_TYPE_LIST = Object.values(RESOURCE_TYPES);

export const SYNC_STATUSES = { SYNCED: "synced", PARTIAL: "partial", FAILED: "failed", NEVER: "never" };

export const WALLED_GARDEN_KINDS = { HOST: "host", IP: "ip" };
export const WALLED_GARDEN_KIND_LIST = Object.values(WALLED_GARDEN_KINDS);

export const HOST_ACTIONS = ["allow", "deny"];
export const IP_ACTIONS = ["accept", "drop", "reject"];
export const OPEN_STATUS_PAGE_VALUES = ["always", "http-login", "not-http"];

export const NETWORK_CONFIG_ERROR_CODES = {
	PROFILE_NOT_FOUND: "HOTSPOT_PROFILE_NOT_FOUND",
	PROFILE_NAME_CONFLICT: "HOTSPOT_PROFILE_NAME_CONFLICT",
	PROFILE_IN_USE: "HOTSPOT_PROFILE_IN_USE",
	PROFILE_UNKNOWN: "HOTSPOT_PROFILE_UNKNOWN",
	WALLED_GARDEN_NOT_FOUND: "WALLED_GARDEN_NOT_FOUND",
	WALLED_GARDEN_CONFLICT: "WALLED_GARDEN_CONFLICT",
	SYNC_NEEDS_ROUTER: "SYNC_NEEDS_ROUTER"
};

export const PROTECTED_PROFILE_NAMES = ["default"];

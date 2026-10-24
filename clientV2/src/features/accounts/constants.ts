export const SERVICE_TYPE_OPTIONS = [
	{ value: "pppoe", label: "Home (PPPoE)" },
	{ value: "hotspot", label: "Hotspot" },
] as const;

export const ACCOUNT_STATUS_OPTIONS = [
	{ value: "active", label: "Active" },
	{ value: "paused", label: "Paused" },
	{ value: "suspended", label: "Suspended" },
	{ value: "terminated", label: "Terminated" },
] as const;

export const APPROVAL_OPTIONS = [
	{ value: "pending", label: "Pending" },
	{ value: "approved", label: "Approved" },
	{ value: "rejected", label: "Rejected" },
] as const;

export const ACCOUNT_ERROR_CODES = {
	WSN_ID_INVALID: "WSN_ID_INVALID",
	WSN_ID_CONFLICT: "WSN_ID_CONFLICT",
	WSN_ID_LOCKED: "WSN_ID_LOCKED",
	ROUTER_PASSWORD_INVALID: "ROUTER_PASSWORD_INVALID",
} as const;

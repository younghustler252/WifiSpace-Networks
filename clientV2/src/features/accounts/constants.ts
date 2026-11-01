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
	ACCESS_METHOD_UNCHANGED: "ACCESS_METHOD_UNCHANGED",
	ACCESS_METHOD_NOT_SUPPORTED: "ACCESS_METHOD_NOT_SUPPORTED",
	ACCOUNT_HAS_NO_ROUTER: "ACCOUNT_HAS_NO_ROUTER",
	MAC_ADDRESS_INVALID: "MAC_ADDRESS_INVALID",
	IPOE_PROFILE_MISSING: "IPOE_PROFILE_MISSING",
	PPP_PROFILE_MISSING: "PPP_PROFILE_MISSING",
} as const;

export const ACCOUNT_ERROR_MESSAGES: Record<string, string> = {
	[ACCOUNT_ERROR_CODES.ACCESS_METHOD_UNCHANGED]: "This account already uses that access method.",
	[ACCOUNT_ERROR_CODES.ACCESS_METHOD_NOT_SUPPORTED]: "Hotspot accounts don't have an access method.",
	[ACCOUNT_ERROR_CODES.ACCOUNT_HAS_NO_ROUTER]: "Assign a router to this account first.",
	[ACCOUNT_ERROR_CODES.MAC_ADDRESS_INVALID]: "Enter a valid MAC address, like AA:BB:CC:DD:EE:FF.",
	[ACCOUNT_ERROR_CODES.IPOE_PROFILE_MISSING]: "This customer's plan has no IPoE profile. Set one on the plan first.",
	[ACCOUNT_ERROR_CODES.PPP_PROFILE_MISSING]: "This customer's plan has no PPP profile. Set one on the plan first.",
};

export const ACCOUNT_TYPES = { PERSONAL: "personal", BUSINESS: "business" };
export const ACCOUNT_TYPE_LIST = Object.values(ACCOUNT_TYPES);

export const APPROVAL_STATUSES = { PENDING: "pending", APPROVED: "approved", REJECTED: "rejected" };
export const APPROVAL_STATUS_LIST = Object.values(APPROVAL_STATUSES);

export const SERVICE_TYPES = { PPPOE: "pppoe", HOTSPOT: "hotspot" };
export const SERVICE_TYPE_LIST = Object.values(SERVICE_TYPES);

export const ACCOUNT_STATUSES = { ACTIVE: "active", SUSPENDED: "suspended", PAUSED: "paused", TERMINATED: "terminated" };
export const ACCOUNT_STATUS_LIST = Object.values(ACCOUNT_STATUSES);

export const PPPOE_ACCESS_METHODS = { PPP: "ppp", IPOE: "ipoe" };
export const PPPOE_ACCESS_METHOD_LIST = Object.values(PPPOE_ACCESS_METHODS);

export const ACCOUNT_ERROR_CODES = {
	ACCOUNT_NOT_FOUND: "ACCOUNT_NOT_FOUND",
	WSN_ID_CONFLICT: "WSN_ID_CONFLICT",
	DEVICE_LIMIT_REACHED: "DEVICE_LIMIT_REACHED",
	DEVICE_ALREADY_REGISTERED: "DEVICE_ALREADY_REGISTERED",
	ACCOUNT_NOT_APPROVED: "ACCOUNT_NOT_APPROVED",
	ACCOUNT_SUSPENDED: "ACCOUNT_SUSPENDED"
};
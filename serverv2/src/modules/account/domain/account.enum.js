// Account Types
export const ACCOUNT_TYPES = {
	PERSONAL: "personal",
	BUSINESS: "business"
};

// Profile Status
export const PROFILE_STATUSES = {
	PENDING: "pending",
	ACTIVE: "active",
	SUSPENDED: "suspended",
	CANCELED: "canceled"
};

// Service Types
export const SERVICE_TYPES = {
	PPPOE: "pppoe",
	HOTSPOT: "hotspot"
};

export const ACCOUNT_TYPE_LIST = Object.values(ACCOUNT_TYPES);
export const PROFILE_STATUS_LIST = Object.values(PROFILE_STATUSES);
export const SERVICE_TYPE_LIST = Object.values(SERVICE_TYPES);
export const ACCOUNT_TYPES = {
	PERSONAL: "personal",
	BUSINESS: "business"
};

export const APPROVAL_STATUSES = {
	PENDING: "pending",
	APPROVED: "approved",
	REJECTED: "rejected"
};

export const SERVICE_TYPES = {
	PPPOE: "pppoe",
	HOTSPOT: "hotspot"
};

export const ACCOUNT_TYPE_LIST = Object.values(ACCOUNT_TYPES);
export const APPROVAL_STATUS_LIST = Object.values(APPROVAL_STATUSES);
export const SERVICE_TYPE_LIST = Object.values(SERVICE_TYPES);
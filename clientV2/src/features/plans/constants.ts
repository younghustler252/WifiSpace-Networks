export const NO_DISCOUNT = "none";
export const NO_ACCOUNT_TYPE = "unset";
export const BYTES_PER_GB = 1024 ** 3;

export const PLAN_SERVICE_OPTIONS = [
	{ value: "pppoe", label: "Home (PPPoE)" },
	{ value: "hotspot", label: "Hotspot" },
] as const;

export const PLAN_STATUS_OPTIONS = [
	{ value: "active", label: "Active" },
	{ value: "inactive", label: "Inactive" },
] as const;

export const DURATION_UNIT_OPTIONS = [
	{ value: "minutes", label: "Minutes" },
	{ value: "hours", label: "Hours" },
	{ value: "days", label: "Days" },
	{ value: "months", label: "Months" },
] as const;

export const DISCOUNT_TYPE_OPTIONS = [
	{ value: "percentage", label: "Percentage (%)" },
	{ value: "flat", label: "Flat amount off" },
] as const;

export const PLAN_ACCOUNT_TYPE_OPTIONS = [
	{ value: "personal", label: "Personal" },
	{ value: "business", label: "Business" },
] as const;

export const PLAN_ERROR_CODES = {
	PLAN_NOT_FOUND: "PLAN_NOT_FOUND",
	PLAN_NAME_CONFLICT: "PLAN_NAME_CONFLICT",
	CANNOT_DELETE_ACTIVE_PLAN: "CANNOT_DELETE_ACTIVE_PLAN",
	INVALID_ACCOUNT_TYPE_FOR_SERVICE: "INVALID_ACCOUNT_TYPE_FOR_SERVICE",
} as const;

export const PLAN_ERROR_MESSAGES: Record<string, string> = {
	[PLAN_ERROR_CODES.PLAN_NOT_FOUND]: "That plan no longer exists. Refresh and try again.",
	[PLAN_ERROR_CODES.PLAN_NAME_CONFLICT]: "A plan with that name already exists. Choose a different name.",
	[PLAN_ERROR_CODES.CANNOT_DELETE_ACTIVE_PLAN]: "Deactivate this plan before deleting it.",
	[PLAN_ERROR_CODES.INVALID_ACCOUNT_TYPE_FOR_SERVICE]: "That customer type isn't available for this service. Business plans are for home internet only.",
};
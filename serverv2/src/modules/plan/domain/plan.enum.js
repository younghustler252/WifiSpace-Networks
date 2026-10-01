import { SERVICE_TYPES, SERVICE_TYPE_LIST } from "../../../shared/constants/service-type.enum.js";

export { SERVICE_TYPES, SERVICE_TYPE_LIST };

export const PLAN_ACCOUNT_TYPES = { PERSONAL: "personal", BUSINESS: "business" };
export const PLAN_ACCOUNT_TYPE_LIST = Object.values(PLAN_ACCOUNT_TYPES);

export const DURATION_UNITS = { MINUTES: "minutes", HOURS: "hours", DAYS: "days", MONTHS: "months" };
export const DURATION_UNIT_LIST = Object.values(DURATION_UNITS);

export const DURATION_UNIT_SECONDS = {
	[DURATION_UNITS.MINUTES]: 60,
	[DURATION_UNITS.HOURS]: 3600,
	[DURATION_UNITS.DAYS]: 86400,
	[DURATION_UNITS.MONTHS]: 30 * 86400 // approximation — a subscription's actual end date should still be computed with real calendar-month math (see Subscription below), this constant is only for entitlement/comparison purposes
};

export const PLAN_STATUSES = { ACTIVE: "active", INACTIVE: "inactive" };
export const PLAN_STATUS_LIST = Object.values(PLAN_STATUSES);

export const DISCOUNT_TYPES = { PERCENTAGE: "percentage", FLAT: "flat" };
export const DISCOUNT_TYPE_LIST = Object.values(DISCOUNT_TYPES);

export const PLAN_ERROR_CODES = {
	PLAN_NOT_FOUND: "PLAN_NOT_FOUND",
	PLAN_NAME_CONFLICT: "PLAN_NAME_CONFLICT",
	CANNOT_DELETE_ACTIVE_PLAN: "CANNOT_DELETE_ACTIVE_PLAN",
	INVALID_ACCOUNT_TYPE_FOR_SERVICE: "INVALID_ACCOUNT_TYPE_FOR_SERVICE"
};
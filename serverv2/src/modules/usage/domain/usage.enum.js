import { SERVICE_TYPES, SERVICE_TYPE_LIST } from "../../../shared/constants/service-type.enum.js";
export { SERVICE_TYPES, SERVICE_TYPE_LIST };

export const USAGE_SOURCES = { MIKROTIK_SYNC: "mikrotik_sync", MANUAL_ADJUSTMENT: "manual_adjustment" };
export const USAGE_SOURCE_LIST = Object.values(USAGE_SOURCES);

export const USAGE_ERROR_CODES = {
	SUBSCRIPTION_NOT_FOUND: "SUBSCRIPTION_NOT_FOUND",
	USAGE_LIMIT_EXCEEDED: "USAGE_LIMIT_EXCEEDED",
	SUMMARY_NOT_FOUND: "SUMMARY_NOT_FOUND"
};
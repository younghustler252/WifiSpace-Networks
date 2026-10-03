export const SUBSCRIPTION_STATUS_OPTIONS = [
	{ value: "pending", label: "Pending" },
	{ value: "active", label: "Active" },
	{ value: "suspended", label: "Suspended" },
	{ value: "expired", label: "Expired" },
	{ value: "canceled", label: "Canceled" },
] as const;

export const MIKROTIK_SYNC_STATUS = { PENDING: "pending", SYNCED: "synced", FAILED: "failed" } as const;

export const SUBSCRIPTION_ERROR_CODES = {
	SUBSCRIPTION_NOT_FOUND: "SUBSCRIPTION_NOT_FOUND",
	PLAN_NOT_ACTIVE: "PLAN_NOT_ACTIVE",
	PLAN_SERVICE_TYPE_MISMATCH: "PLAN_SERVICE_TYPE_MISMATCH",
	ACCOUNT_ALREADY_HAS_ACTIVE_SUBSCRIPTION: "ACCOUNT_ALREADY_HAS_ACTIVE_SUBSCRIPTION",
	INVALID_STATUS_TRANSITION: "INVALID_STATUS_TRANSITION",
	SUBSCRIPTION_NOT_ACTIVE: "SUBSCRIPTION_NOT_ACTIVE",
	SUBSCRIPTION_ALREADY_CANCELED: "SUBSCRIPTION_ALREADY_CANCELED",
	CANNOT_SUSPEND_INACTIVE_SUBSCRIPTION: "CANNOT_SUSPEND_INACTIVE_SUBSCRIPTION",
	INVALID_EXTENSION_DAYS: "INVALID_EXTENSION_DAYS",
} as const;

export const SUBSCRIPTION_ERROR_MESSAGES: Record<string, string> = {
	[SUBSCRIPTION_ERROR_CODES.SUBSCRIPTION_NOT_FOUND]: "This subscription no longer exists. Refresh and try again.",
	[SUBSCRIPTION_ERROR_CODES.PLAN_NOT_ACTIVE]: "That plan isn't active. Choose another plan.",
	[SUBSCRIPTION_ERROR_CODES.PLAN_SERVICE_TYPE_MISMATCH]: "That plan doesn't match this account's service type.",
	[SUBSCRIPTION_ERROR_CODES.ACCOUNT_ALREADY_HAS_ACTIVE_SUBSCRIPTION]:
		"This account already has an active subscription. Renew it or change the plan instead.",
	[SUBSCRIPTION_ERROR_CODES.INVALID_STATUS_TRANSITION]: "That action isn't allowed for the subscription's current status.",
	[SUBSCRIPTION_ERROR_CODES.SUBSCRIPTION_NOT_ACTIVE]: "This subscription isn't active.",
	[SUBSCRIPTION_ERROR_CODES.SUBSCRIPTION_ALREADY_CANCELED]: "This subscription is already canceled.",
	[SUBSCRIPTION_ERROR_CODES.CANNOT_SUSPEND_INACTIVE_SUBSCRIPTION]: "Only active subscriptions can be suspended.",
	[SUBSCRIPTION_ERROR_CODES.INVALID_EXTENSION_DAYS]: "Enter a valid number of days. It can't be 0.",
};
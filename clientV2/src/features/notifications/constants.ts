export const NOTIFICATION_TYPES = {
	PAYMENT_RECEIVED: "payment_received",
	PAYMENT_FAILED: "payment_failed",
	SUBSCRIPTION_ACTIVATED: "subscription_activated",
	SUBSCRIPTION_EXPIRING: "subscription_expiring",
	SUBSCRIPTION_EXPIRED: "subscription_expired",
	ACCOUNT_APPROVED: "account_approved",
	ACCOUNT_REJECTED: "account_rejected",
	ACCOUNT_SUSPENDED: "account_suspended",
	ADMIN_BROADCAST: "admin_broadcast",
	SYSTEM_ALERT: "system_alert",
} as const;

export const NOTIFICATION_RECIPIENT_STATUS = {
	PENDING: "PENDING",
	QUEUED: "QUEUED",
	SENT: "SENT",
	DELIVERED: "DELIVERED",
	READ: "READ",
	FAILED: "FAILED",
	CANCELLED: "CANCELLED",
} as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];
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
export const NOTIFICATION_CHANNEL_OPTIONS = [
	{ value: "email", label: "Email" },
	{ value: "sms", label: "SMS" },
	{ value: "whatsapp", label: "WhatsApp" },
	{ value: "push", label: "Push" },
	{ value: "in_app", label: "In-app" },
] as const;

export const NOTIFICATION_PRIORITY_OPTIONS = [
	{ value: "LOW", label: "Low" },
	{ value: "NORMAL", label: "Normal" },
	{ value: "HIGH", label: "High" },
	{ value: "CRITICAL", label: "Critical" },
] as const;

export const COMPOSER_TYPE_OPTIONS = [
	{ value: "admin_broadcast", label: "Announcement" },
	{ value: "system_alert", label: "System alert" },
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];

export const NOTIFICATION_ERROR_CODES = {
	NOTIFICATION_NOT_FOUND: "NOTIFICATION_NOT_FOUND",
	RECIPIENT_NOT_FOUND: "RECIPIENT_NOT_FOUND",
	UNSUPPORTED_CHANNEL: "UNSUPPORTED_CHANNEL",
} as const;
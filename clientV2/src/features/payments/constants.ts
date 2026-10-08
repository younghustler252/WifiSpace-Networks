export const PAYMENT_STATUS_OPTIONS = [
	{ value: "initiated", label: "Initiated" },
	{ value: "pending", label: "Pending" },
	{ value: "successful", label: "Successful" },
	{ value: "failed", label: "Failed" },
	{ value: "expired", label: "Expired" },
	{ value: "refunded", label: "Refunded" },
] as const;

export const PAYMENT_CHANNEL_OPTIONS = [
	{ value: "cash", label: "Cash" },
	{ value: "bank_transfer", label: "Bank transfer" },
	{ value: "mobile_money", label: "Mobile money" },
] as const;

export const SETTABLE_STATUS_OPTIONS = [
	{ value: "successful", label: "Successful (money received)" },
	{ value: "failed", label: "Failed" },
	{ value: "expired", label: "Expired" },
] as const;

export const PAYMENT_ERROR_CODES = {
	PAYMENT_NOT_FOUND: "PAYMENT_NOT_FOUND",
	GATEWAY_INIT_FAILED: "GATEWAY_INIT_FAILED",
	GATEWAY_VERIFY_FAILED: "GATEWAY_VERIFY_FAILED",
	INVALID_WEBHOOK_SIGNATURE: "INVALID_WEBHOOK_SIGNATURE",
	UNSUPPORTED_GATEWAY: "UNSUPPORTED_GATEWAY",
} as const;

export const PAYMENT_ERROR_MESSAGES: Record<string, string> = {
	[PAYMENT_ERROR_CODES.PAYMENT_NOT_FOUND]: "We couldn't find that payment.",
	[PAYMENT_ERROR_CODES.GATEWAY_INIT_FAILED]: "We couldn't start the payment. Please try again in a moment.",
	[PAYMENT_ERROR_CODES.GATEWAY_VERIFY_FAILED]: "We couldn't confirm the payment yet. Try again shortly.",
	[PAYMENT_ERROR_CODES.UNSUPPORTED_GATEWAY]: "That payment method isn't available right now.",
};
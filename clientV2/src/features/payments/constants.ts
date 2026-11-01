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
	{ value: "pos", label: "POS" },
	{ value: "mobile_money", label: "Mobile money" },
	{ value: "wallet", label: "Wallet" },
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
	NO_SAVED_CARD: "NO_SAVED_CARD",
	CARD_EXPIRED: "CARD_EXPIRED",
	CARD_CHARGE_FAILED: "CARD_CHARGE_FAILED",
	CARD_CHARGE_PENDING: "CARD_CHARGE_PENDING",
	CARD_AMOUNT_MISMATCH: "CARD_AMOUNT_MISMATCH",
} as const;

export const PAYMENT_ERROR_MESSAGES: Record<string, string> = {
	[PAYMENT_ERROR_CODES.PAYMENT_NOT_FOUND]: "We couldn't find that payment.",
	[PAYMENT_ERROR_CODES.GATEWAY_INIT_FAILED]: "We couldn't start the payment. Please try again in a moment.",
	[PAYMENT_ERROR_CODES.GATEWAY_VERIFY_FAILED]: "We couldn't confirm the payment yet. Try again shortly.",
	[PAYMENT_ERROR_CODES.UNSUPPORTED_GATEWAY]: "That payment method isn't available right now.",
	[PAYMENT_ERROR_CODES.NO_SAVED_CARD]: "You don't have a saved card yet. Pay once by card and we'll offer to keep it.",
	[PAYMENT_ERROR_CODES.CARD_EXPIRED]: "That card has expired. Choose another card or pay by card checkout.",
	[PAYMENT_ERROR_CODES.CARD_CHARGE_PENDING]: "Your bank is still confirming the payment. Don't pay again. Your plan is applied automatically once it's confirmed.",
	[PAYMENT_ERROR_CODES.CARD_AMOUNT_MISMATCH]: "We couldn't match the amount charged. Contact support before paying again.",
	DOWNGRADE_NOT_ALLOWED: "You can only move to a higher plan mid-cycle. Pick your current plan to renew, or a higher one.",
};
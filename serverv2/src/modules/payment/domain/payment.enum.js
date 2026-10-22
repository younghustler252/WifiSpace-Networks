export const PAYMENT_STATUSES = {
	INITIATED: "initiated",
	PENDING: "pending",
	SUCCESSFUL: "successful",
	FAILED: "failed",
	EXPIRED: "expired",
	REFUNDED: "refunded"
};
export const PAYMENT_STATUS_LIST = Object.values(PAYMENT_STATUSES);

export const PAYMENT_CHANNELS = { CARD: "card", BANK_TRANSFER: "bank_transfer", USSD: "ussd", QR: "qr", MOBILE_MONEY: "mobile_money", CASH: "cash", WALLET: "wallet" };
export const PAYMENT_CHANNEL_LIST = Object.values(PAYMENT_CHANNELS);

export const PAYMENT_GATEWAYS = { PAYSTACK: "paystack", FLUTTERWAVE: "flutterwave", CASH: "cash", WALLET: "wallet" };
export const PAYMENT_GATEWAY_LIST = Object.values(PAYMENT_GATEWAYS);

export const PAYMENT_ACTIONS = { NEW_SUBSCRIPTION: "new_subscription", RENEWAL: "renewal", UPGRADE: "upgrade", DOWNGRADE: "downgrade" };
export const PAYMENT_ACTION_LIST = Object.values(PAYMENT_ACTIONS);

export const PAYMENT_ERROR_CODES = {
	PAYMENT_NOT_FOUND: "PAYMENT_NOT_FOUND",
	GATEWAY_INIT_FAILED: "GATEWAY_INIT_FAILED",
	GATEWAY_VERIFY_FAILED: "GATEWAY_VERIFY_FAILED",
	INVALID_WEBHOOK_SIGNATURE: "INVALID_WEBHOOK_SIGNATURE",
	UNSUPPORTED_GATEWAY: "UNSUPPORTED_GATEWAY"
};
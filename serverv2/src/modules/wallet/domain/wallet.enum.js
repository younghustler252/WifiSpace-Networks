export const WALLET_TX_TYPES = { CREDIT: "credit", DEBIT: "debit" };
export const WALLET_TX_TYPE_LIST = Object.values(WALLET_TX_TYPES);

export const WALLET_TX_SOURCES = {
	TRANSFER: "transfer",
	PAYMENT: "payment",
	PAYMENT_ROLLBACK: "payment_rollback",
	REVERSAL: "reversal",
	ADMIN_ADJUSTMENT: "admin_adjustment"
};
export const WALLET_TX_SOURCE_LIST = Object.values(WALLET_TX_SOURCES);

export const WALLET_ERROR_CODES = {
	WALLET_NOT_FOUND: "WALLET_NOT_FOUND",
	INSUFFICIENT_BALANCE: "INSUFFICIENT_BALANCE",
	VIRTUAL_ACCOUNT_FAILED: "VIRTUAL_ACCOUNT_FAILED"
};

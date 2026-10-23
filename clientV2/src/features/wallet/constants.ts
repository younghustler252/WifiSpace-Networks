import type { WalletTxSource } from "./types/wallet.types";

export const WALLET_ERROR_CODES = {
	WALLET_NOT_FOUND: "WALLET_NOT_FOUND",
	INSUFFICIENT_BALANCE: "INSUFFICIENT_BALANCE",
	VIRTUAL_ACCOUNT_FAILED: "VIRTUAL_ACCOUNT_FAILED",
} as const;

export const WALLET_ERROR_MESSAGES: Record<string, string> = {
	[WALLET_ERROR_CODES.WALLET_NOT_FOUND]: "We couldn't find that wallet.",
	[WALLET_ERROR_CODES.INSUFFICIENT_BALANCE]: "Your wallet balance isn't enough for this plan. Top it up and try again.",
	[WALLET_ERROR_CODES.VIRTUAL_ACCOUNT_FAILED]: "We couldn't create your account number right now. Please try again shortly.",
};

export const WALLET_TX_SOURCE_LABELS: Record<string, string> = {
	transfer: "Bank transfer",
	payment: "Plan payment",
	payment_rollback: "Refund: activation failed",
	reversal: "Payment reversed",
	admin_adjustment: "Adjustment by WifiSpace",
};

export function txSourceLabel(source: WalletTxSource) {
	return WALLET_TX_SOURCE_LABELS[source] ?? source.replace(/_/g, " ");
}

export const WALLET_DIRECTION_OPTIONS = [
	{ value: "credit", label: "Add money (credit)" },
	{ value: "debit", label: "Remove money (debit)" },
] as const;

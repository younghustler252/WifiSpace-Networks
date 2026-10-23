export interface WalletVirtualAccount {
	accountNumber: string | null;
	bankName: string | null;
	accountName: string | null;
}

export interface Wallet {
	id: string;
	balance: number;
	balanceKobo: number;
	currency: string;
	virtualAccount: WalletVirtualAccount | null;
}

export type WalletTxType = "credit" | "debit";
export type WalletTxSource = "transfer" | "payment" | "payment_rollback" | "reversal" | "admin_adjustment" | (string & {});

export interface WalletTransaction {
	id?: string;
	walletId: string;
	userId: string;
	type: WalletTxType;
	source: WalletTxSource;
	amount: number;
	amountKobo: number;
	balanceAfter: number | null;
	reference: string;
	description: string | null;
	metadata?: Record<string, unknown> | null;
	createdAt: string;
}

export interface PayWithWalletBody {
	accountId: string;
	planId: string;
	cycles?: number;
}

export interface PayWithWalletResult {
	payment: { id: string; status: string; gatewayReference: string };
	balance: number;
	provisioning: unknown;
}

export interface AdjustWalletBody {
	direction: "credit" | "debit";
	amount: number;
	reason: string;
}

export interface InsufficientBalanceDetails {
	balance: number;
	required: number;
	shortfall: number;
}

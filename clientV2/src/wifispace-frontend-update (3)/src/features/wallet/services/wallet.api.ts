import { API } from "@/lib/api/api-client";
import { friendly } from "@/lib/api/friendly";
import { withIdempotency } from "@/lib/api/idempotency";
import type { ApiResponse } from "@/types/api-response";
import { WALLET_ERROR_MESSAGES } from "../constants";
import type { AdjustWalletBody, PayWithWalletBody, PayWithWalletResult, Wallet, WalletTransaction } from "../types/wallet.types";

const withMessages = <T>(request: Promise<ApiResponse<T>>) => request.then((res) => friendly(res, WALLET_ERROR_MESSAGES));

export const walletApi = {
	me: () => withMessages(API.get<Wallet>("/wallet/me")),
	transactions: (params: { page?: number; limit?: number }) => withMessages(API.get<WalletTransaction[]>("/wallet/me/transactions", { params })),
	virtualAccount: () => withMessages(API.post<Wallet>("/wallet/me/virtual-account", {})),
	pay: (body: PayWithWalletBody, key?: string) => withMessages(API.post<PayWithWalletResult>("/wallet/me/pay", body, withIdempotency(key))),
};

export const adminWalletApi = {
	get: (userId: string) => withMessages(API.get<Wallet>(`/wallet/admin/${userId}`)),
	transactions: (userId: string, params: { page?: number; limit?: number }) =>
		withMessages(API.get<WalletTransaction[]>(`/wallet/admin/${userId}/transactions`, { params })),
	adjust: (userId: string, body: AdjustWalletBody, key?: string) =>
		withMessages(API.post<Wallet>(`/wallet/admin/${userId}/adjust`, body, withIdempotency(key))),
};

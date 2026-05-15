import { API } from "./client";
import { ApiResponse, Account } from "./types";

// ================================
// REQUEST TYPES
// ================================

interface RequestAccountDto {
	name: string;
}

interface UpdateAccountDto {
	name?: string;
	status?: string;
}

interface TransferAccountDto {
	toAccountId: string;
	amount: number;
}

// ================================
// ACCOUNT API
// ================================

export const accountApi = {
	// -----------------------------
	// USER / SELF ROUTES
	// -----------------------------

	getMyAccounts: (): Promise<ApiResponse<Account[]>> =>
		API.get("/accounts/self"),

	requestAccount: (
		data: RequestAccountDto
	): Promise<ApiResponse<Account>> =>
		API.post("/accounts/self/request", data),

	updateMyAccount: (
		accountId: string,
		data: UpdateAccountDto
	): Promise<ApiResponse<Account>> =>
		API.put(`/accounts/self/${accountId}`, data),

	// -----------------------------
	// ADMIN ROUTES
	// -----------------------------

	createAccount: (
		data: RequestAccountDto
	): Promise<ApiResponse<Account>> =>
		API.post("/accounts/admin/create", data),

	updateAccount: (
		accountId: string,
		data: UpdateAccountDto
	): Promise<ApiResponse<Account>> =>
		API.put(`/accounts/admin/${accountId}`, data),

	deleteAccount: (
		accountId: string
	): Promise<ApiResponse<null>> =>
		API.delete(`/accounts/admin/${accountId}`),

	activateAccount: (
		accountId: string
	): Promise<ApiResponse<Account>> =>
		API.post(`/accounts/admin/${accountId}/activate`),

	suspendAccount: (
		accountId: string
	): Promise<ApiResponse<Account>> =>
		API.post(`/accounts/admin/${accountId}/suspend`),

	transferAccount: (
		accountId: string,
		data: TransferAccountDto
	): Promise<ApiResponse<Account>> =>
		API.post(`/accounts/admin/${accountId}/transfer`, data),

	getAllAccounts: async (params?: {
		userId?: string;
		accountType?: string;
		serviceType?: string;
		profileStatus?: string;

		sort?: "wsnid_desc" | "wsnid_asc" | "newest" | "oldest";
		skip?: number;
		limit?: number;
	}): Promise<ApiResponse<{
		data: Account[];
		total: number;
		skip: number;
		limit: number;
	}>> => {
		const { data } = await API.get("/accounts/admin/all", { params });

		return data;
	},
	// -----------------------------
	// SHARED ROUTES
	// -----------------------------

	getAccountById: (
		accountId: string
	): Promise<ApiResponse<Account>> =>
		API.get(`/accounts/${accountId}`),

	getAccountByWSN: (
		wsn: string
	): Promise<ApiResponse<Account>> =>
		API.get(`/accounts/wsn/${wsn}`),
};
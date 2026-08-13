import { API } from "@/lib/api/client"
import {
	ApiResponse,
	PaginatedResponse
} from "@/types/api-response";

import {
	Account,
    AccountStats,
	CreateAccountDto,
	UpdateMyAccountDto,
	UpdateAccountDto,
	RejectAccountDto,
	TransferAccountDto,
	ChangeAccountPasswordDto,
	GetAllAccountsParams
} from "./account.types";

// ================================
// ACCOUNT API
// ================================

export const accountApi = {

	// ================================
	// USER / SELF SERVICE
	// ================================

	getMyAccounts: (): Promise<ApiResponse<Account[]>> =>
		API.get("/accounts"),

	requestAccount: (
		data: CreateAccountDto
	): Promise<ApiResponse<Account>> =>
		API.post("/accounts/request", data),

	getMyAccount: (
		accountId: string
	): Promise<ApiResponse<Account>> =>
		API.get(`/accounts/${accountId}`),

	updateMyAccount: (
		accountId: string,
		data: UpdateMyAccountDto
	): Promise<ApiResponse<Account>> =>
		API.put(`/accounts/${accountId}`, data),


	// ================================
	// ADMIN
	// ================================

	createAccount: (
		data: CreateAccountDto
	): Promise<ApiResponse<Account>> =>
		API.post("/accounts/admin", data),

	getAllAccounts: (
		params?: GetAllAccountsParams
	): Promise<PaginatedResponse<Account>> =>
		API.get("/accounts/admin", {
			params
		}),

	getAccountById: (
		accountId: string
	): Promise<ApiResponse<Account>> =>
		API.get(`/accounts/admin/${accountId}`),

	getAccountStats: (): Promise<ApiResponse<AccountStats>> =>
		API.get("/accounts/admin/stats"),

	updateAccount: (
		accountId: string,
		data: UpdateAccountDto
	): Promise<ApiResponse<Account>> =>
		API.put(`/accounts/admin/${accountId}`, data),

	approveAccount: (
		accountId: string
	): Promise<ApiResponse<Account>> =>
		API.patch(`/accounts/admin/${accountId}/approve`),

	rejectAccount: (
		accountId: string,
		data: RejectAccountDto
	): Promise<ApiResponse<Account>> =>
		API.patch(`/accounts/admin/${accountId}/reject`, data),

	suspendAccount: (
		accountId: string
	): Promise<ApiResponse<Account>> =>
		API.patch(`/accounts/admin/${accountId}/suspend`),

	transferAccount: (
		accountId: string,
		data: TransferAccountDto
	): Promise<ApiResponse<Account>> =>
		API.patch(`/accounts/admin/${accountId}/transfer`, data),

	changeAccountPassword: (
		accountId: string,
		data: ChangeAccountPasswordDto
	): Promise<ApiResponse<Account>> =>
		API.patch(
			`/accounts/admin/${accountId}/router-password`,
			data
		),

	deleteAccount: (
		accountId: string
	): Promise<ApiResponse<Account | null>> =>
		API.delete(`/accounts/admin/${accountId}`)
};
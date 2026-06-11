import { API } from "./client";
import { ApiResponse } from "./types";

// ================================
// TYPES (ALIGNED WITH MONGOOSE)
// ================================

export interface Account {
	id: string;

	userId?: string;

	user: {
		_id: string;
		firstName: string;
		lastName: string;
		email: string;
		avatar?: {
			url: string;
		};
	} | null;

	accountType: "personal" | "business";

	businessName?: string;
	companyRegistrationNumber?: string;
	taxId?: string;

	wsnId: string;

	routerPassword?: string;

	routerId?: string;

	routerProfile: string;

	macAddress?: string;

	serviceType: "pppoe" | "hotspot";

	profileStatus: "pending" | "active" | "suspended" | "canceled";

	limitUptime: string;

	lastSeenAt?: string;

	mikrotikUserCreated: boolean;

	createdAt: string;
	updatedAt: string;
}

// ================================
// REQUEST DTOs
// ================================

export interface CreateAccountDto {
	userId?: string;
	
	accountType?: "personal" | "business";

	businessName?: string;
	companyRegistrationNumber?: string;
	taxId?: string;

	wsnId: string;

	routerPassword?: string;

	routerId?: string;

	routerProfile?: string;

	macAddress?: string;

	serviceType?: "pppoe" | "hotspot";

	limitUptime?: string;
}

export interface UpdateAccountDto extends Partial<CreateAccountDto> {
	profileStatus?: "pending" | "active" | "suspended" | "canceled";
}

export interface TransferAccountDto {
	toAccountId: string;
}

// ================================
// LIST RESPONSE
// ================================

export interface AccountListResponse {
	data: Account[];
	total: number;
	skip: number;
	limit: number;
}
export interface ChangeAccountPasswordDto {
	routerPassword: string;
}

// ================================
// ACCOUNT API
// ================================

export const accountApi = {
	// -----------------------------
	// USER (SELF SERVICE)
	// -----------------------------

	getMyAccounts: (): Promise<ApiResponse<AccountListResponse>> =>
		API.get("/accounts/self"),

	requestAccount: (
		data: CreateAccountDto
	): Promise<ApiResponse<Account>> =>
		API.post("/accounts/self/request", data),

	updateMyAccount: (
		accountId: string,
		data: UpdateAccountDto
	): Promise<ApiResponse<Account>> =>
		API.put(`/accounts/self/${accountId}`, data),

	// -----------------------------
	// ADMIN OPERATIONS
	// -----------------------------

	createAccount: (
		data: CreateAccountDto
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

	changeAccountPassword: (
		accountId: string,
		data: ChangeAccountPasswordDto
	): Promise<ApiResponse<Account>> =>
		API.patch(
			`/accounts/admin/${accountId}/router-password`,
			data
		),

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

	// -----------------------------
	// LISTING (ADMIN)
	// -----------------------------

	getAllAccounts: async (params?: {
		userId?: string;
		search?: string;
		accountType?: "personal" | "business";
		serviceType?: "pppoe" | "hotspot";
		profileStatus?: "pending" | "active" | "suspended" | "canceled";

		sort?: "wsnid_desc" | "wsnid_asc" | "newest" | "oldest";
		skip?: number;
		limit?: number;
	}): Promise<AccountListResponse> => {
		const res = await API.get("/accounts/admin/all", {
			params,
		});

		return res.data;
	},

	// -----------------------------
	// SINGLE LOOKUP
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
import { Account } from "@/lib/api/types";
import { API } from "./client";
import { ApiResponse } from "./types";

// ===================================
// ENUM TYPES (MATCH BACKEND)
// ===================================
export type PaymentActionType = "new_subscription" | "renewal" | "upgrade";

export type PaymentStatus = "initiated" | "pending" | "successful" | "failed" | "expired";

export type PaymentChannel = "card" | "bank_transfer" | "ussd" | "cash";

export type PaymentGateway = "paystack" | "manual";

// ===================================
// TYPES
// ===================================
export interface PlanRef {
	_id: string;
	name: string;
	price: number;
}

// REQUEST TYPES
export interface CreatePaymentDto {
	accountId: string;
	planId: string;
	subscriptionId?: string;
	cycles?: number;
	paymentChannel?: PaymentChannel;
}

export interface ConfirmPaymentDto {
	reference: string;
}

// RESPONSE TYPES
export interface PaymentAmount {
	total: number;
	base: number;
	discount: number;
}

export interface Payment {
	id: string;

	// relationships
	userId: string;
	accountId: Account;
	subscriptionId?: string | null;
	planId?: PlanRef;
	account?: Account;

	// billing
	amount: PaymentAmount;
	cycles: number;

	// state
	status: PaymentStatus;

	// channel
	paymentChannel?: PaymentChannel | null;
	actionType?: PaymentActionType;
	gateway: PaymentGateway;
	gatewayReference?: string;

	// safety
	idempotencyKey?: string;

	// processing flags
	processed?: boolean;
	businessProcessed?: boolean;
	isWebhookProcessed?: boolean;

	// timing
	paymentDate: string;
	processedAt?: string;
	failedAt?: string;
	failureReason?: string;

	createdAt: string;
	updatedAt: string;

	metadata?: Record<string, any>;
}

export interface CreatePaymentResponse {
	payment: Payment;
	paystack?: {
		status: boolean;
		message: string;
		data: {
			authorization_url: string;
			access_code: string;
			reference: string;
		};
	};
}

export interface ConfirmPaymentResponse {
	payment: Payment;
	gatewayResponse?: any;
	alreadyProcessed?: boolean;
}

// pagination
export interface PaymentListData {
	data: Payment[];
	pagination: {
		total: number;
		skip: number;
		limit: number;
		totalPages: number;
	};
}
export interface ResolvePaymentDto {
	reference: string;
}

export interface ResolvePaymentResponse {
	reference: string;
	serviceType: string;
	redirectTo: string;
}

// ===================================
// PAYMENT API
// ===================================
export const paymentApi = {
	// ================================
	// USER
	// ================================
	create: (data: CreatePaymentDto): Promise<ApiResponse<CreatePaymentResponse>> =>
		API.post("/payments", data),

	confirm: (data: ConfirmPaymentDto): Promise<ApiResponse<ConfirmPaymentResponse>> =>
		API.post("/payments/confirm", data),

	resolve: (
		data: ResolvePaymentDto
	): Promise<ApiResponse<ResolvePaymentResponse>> =>
		API.get("/payments/resolve", {
			params: {
				reference: data.reference
			}
		}),

	reprocess: (paymentId: string): Promise<ApiResponse<ConfirmPaymentResponse>> =>
		API.post(`/payments/${paymentId}/reprocess`),

	getMyPayments: (params?: { page?: number; limit?: number; status?: PaymentStatus }) =>
		API.get<ApiResponse<PaymentListData>>("/payments/me", { params }),

	// ================================
	// ADMIN
	// ================================
	adminRecord: (data: CreatePaymentDto): Promise<ApiResponse<Payment>> =>
		API.post("/payments/admin/record", data),

	updateStatus: (data: { paymentId: string; status: PaymentStatus }): Promise<ApiResponse<Payment>> =>
		API.patch("/payments/admin/status", data),

	getAll: (params?: {
	search?: string;

	accountId?: string;

	status?: PaymentStatus;

	gateway?: PaymentGateway;

	paymentChannel?: PaymentChannel;

	actionType?: PaymentActionType;

	businessProcessed?: boolean;

	isWebhookProcessed?: boolean;

	fromDate?: string;

	toDate?: string;

	skip?: number;

	limit?: number;

	sort?:
		| "newest"
		| "oldest"
		| "amount_desc"
		| "amount_asc";
}): Promise<ApiResponse<PaymentListData>> =>
	API.get("/payments/all", {
		params,
	}),

	getById: (id: string): Promise<ApiResponse<Payment>> =>
		API.get(`/payments/${id}`)
};
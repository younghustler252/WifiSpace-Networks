import { API } from "@/lib/api/client";
import { ApiResponse } from "@/lib/api/types";

import type {
	CreatePaymentDto,
	CreatePaymentResponse,
	ConfirmPaymentDto,
	ConfirmPaymentResponse,
	ResolvePaymentDto,
	ResolvePaymentResponse,
	PaymentListData,
	Payment,
	PaymentStatus,
	PaymentGateway,
	PaymentChannel,
	PaymentActionType
} from "./payment.types";

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
			params: { reference: data.reference }
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
		sort?: "newest" | "oldest" | "amount_desc" | "amount_asc";
	}): Promise<ApiResponse<PaymentListData>> =>
		API.get("/payments/all", { params }),

	getById: (id: string): Promise<ApiResponse<Payment>> =>
		API.get(`/payments/${id}`)
};
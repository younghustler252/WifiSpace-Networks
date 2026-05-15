import { Account } from '@/lib/api/types';
import { API } from "./client";
import { ApiResponse } from "./types";

// ================================
// REQUEST TYPES
// ================================

interface CreatePaymentDto {
	accountId: string;   // ✅ REQUIRED
	planId: string;
	cycles: number;
	method: "paystack";
}

interface ConfirmPaymentDto {
	transactionId: string;
}

interface UpdatePaymentStatusDto {
	paymentId: string;
	status: "pending" | "success" | "failed";
}


interface CreatePaymentResponse {
	payment: Payment;
	paystack: {
		status: boolean;
		message: string;
		data: {
			authorization_url: string;
			access_code: string;
			reference: string;
		};
	};
}
// ================================
// RESPONSE TYPES
// ================================

export interface Payment {
	id: string;

	userId: string;
	accountId?: string;
	planId: string;

	wsnId?: string;
	account?: Account;

	amount: number;
	cycles: number;
	bonusDays: number;

	method: "paystack" | "credit_card" | "bank_transfer";

	status: "pending" | "successful" | "failed" | "expired";

	transactionId?: string;

	paymentDate: string;

	subscriptionStartDate?: string;
	subscriptionEndDate?: string;

	subscriptionStatus: "active" | "suspended" | "expired" | "canceled";

	paymentDetails?: Record<string, any>;

	createdAt: string;
	updatedAt: string;
}

export interface PaymentListData {
	data: Payment[];
	pagination: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	};
}

// ================================
// PAYMENT API
// ================================

export const paymentApi = {
	// -----------------------------
	// USER
	// -----------------------------

	create: (
		data: CreatePaymentDto
	): Promise<ApiResponse<CreatePaymentResponse>> =>
		API.post("/payments", data),

	confirm: (
		data: ConfirmPaymentDto
	): Promise<ApiResponse<Payment>> =>
		API.post("/payments/confirm", data),

	// getMyPayments: (
	// 	params?: { page?: number; limit?: number; status?: string }
	// ): Promise<ApiResponse<PaymentListData>> =>
	// 	API.get("/payments/me", { params }),

	// -----------------------------
	// ADMIN
	// -----------------------------

	adminCreate: (
		data: CreatePaymentDto
	): Promise<ApiResponse<Payment>> =>
		API.post("/payments/admin", data),

	updateStatus: (
		data: {
			paymentId: string;
			status: Payment["status"];
		}
	): Promise<ApiResponse<Payment>> =>
		API.patch("/payments/admin/status", data),

	getAll: (
		params?: {
			status?: string;
			userId?: string;
			accountId?: string;

			page?: number;
			limit?: number;

			fromDate?: string;
			toDate?: string;

			sortField?: string;
			sortOrder?: "asc" | "desc";
		}
	): Promise<ApiResponse<PaymentListData>> =>
		API.get("/payments/all", { params }),

	getById: (id: string): Promise<ApiResponse<Payment>> =>
		API.get(`/payments/admin/${id}`),
};
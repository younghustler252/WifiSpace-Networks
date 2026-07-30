import {
	useQuery,
	useMutation
} from "@tanstack/react-query";

import { paymentApi } from "../api/payment.api";

import type {
	CreatePaymentDto,
	ConfirmPaymentDto,
	ResolvePaymentDto,
	PaymentStatus,
	PaymentGateway,
	PaymentChannel,
	PaymentActionType
} from "../api/payment.types";

// ========================================
// Create
// ========================================
export function useCreatePayment() {
	return useMutation({
		// CHANGED: was returning the raw ApiResponse<T> envelope in every hook
		// here — same unwrap fix applied to the hotspot module earlier. This
		// is what was making `res?.data?.paystack...` necessary at call sites;
		// with this fixed, callers get CreatePaymentResponse directly.
		mutationFn: async (data: CreatePaymentDto) => {
			const res = await paymentApi.create(data);
			return res.data;
		}
	});
}

// ========================================
// Confirm
// ========================================
export function useConfirmPayment() {
	return useMutation({
		mutationFn: async (data: ConfirmPaymentDto) => {
			const res = await paymentApi.confirm(data);
			return res.data;
		}
	});
}

// ========================================
// Resolve
// ========================================
export function useResolvePayment() {
	return useMutation({
		mutationFn: async (data: ResolvePaymentDto) => {
			const res = await paymentApi.resolve(data);
			return res.data;
		}
	});
}

// ========================================
// Reprocess (admin)
// ========================================
export function useReprocessPayment() {
	return useMutation({
		mutationFn: async (paymentId: string) => {
			const res = await paymentApi.reprocess(paymentId);
			return res.data;
		}
	});
}

// ========================================
// My Payments
// ========================================
export function useMyPayments(params?: { page?: number; limit?: number; status?: PaymentStatus }) {
	return useQuery({
		queryKey: ["payments", "me", params],
		queryFn: async () => {
			const res = await paymentApi.getMyPayments(params);
			return res.data;
		}
	});
}

// ========================================
// Get By Id
// ========================================
export function usePayment(id: string) {
	return useQuery({
		queryKey: ["payments", id],
		queryFn: async () => {
			const res = await paymentApi.getById(id);
			return res.data;
		},
		enabled: Boolean(id)
	});
}

// ========================================
// Admin: Record
// ========================================
export function useAdminRecordPayment() {
	return useMutation({
		mutationFn: async (data: CreatePaymentDto) => {
			const res = await paymentApi.adminRecord(data);
			return res.data;
		}
	});
}

// ========================================
// Admin: Update Status
// ========================================
export function useUpdatePaymentStatus() {
	return useMutation({
		mutationFn: async (data: { paymentId: string; status: PaymentStatus }) => {
			const res = await paymentApi.updateStatus(data);
			return res.data;
		}
	});
}

// ========================================
// Admin: List All
// ========================================
export function useAllPayments(params?: {
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
}) {
	return useQuery({
		queryKey: ["payments", "all", params],
		queryFn: async () => {
			const res = await paymentApi.getAll(params);
			return res.data;
		}
	});
}
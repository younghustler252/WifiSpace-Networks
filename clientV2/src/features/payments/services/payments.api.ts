import { API } from "@/lib/api/api-client";
import { friendly } from "@/lib/api/friendly";
import type { ApiResponse } from "@/types/api-response";
import { PAYMENT_ERROR_MESSAGES } from "../constants";
import type {
	AdminPayment,
	AdminPaymentDetail,
	AdminPaymentListParams,
	InitPaymentBody,
	InitPaymentResult,
	Payment,
	RecordPaymentBody,
	UpdatePaymentStatusBody,
	VerifyPaymentResult,
} from "../types/payments.types";
import { withIdempotency } from "@/lib/api/idempotency";

const withMessages = <T>(request: Promise<ApiResponse<T>>) => request.then((res) => friendly(res, PAYMENT_ERROR_MESSAGES));

export const paymentsApi = {
	init: (body: InitPaymentBody, key?: string) => withMessages(API.post<InitPaymentResult>("/payments", body, withIdempotency(key))),
	verify: (reference: string) => withMessages(API.get<VerifyPaymentResult>(`/payments/verify/${encodeURIComponent(reference)}`)),
	listMine: (params: { page?: number; limit?: number }) => withMessages(API.get<Payment[]>("/payments/me", { params })),
};

const ADMIN = "/payments/admin";

export const adminPaymentsApi = {
	list: (params: AdminPaymentListParams) => withMessages(API.get<AdminPayment[]>(ADMIN, { params })),
	get: (id: string) => withMessages(API.get<AdminPaymentDetail>(`${ADMIN}/${id}`)),
	record: (body: RecordPaymentBody, key?: string) => withMessages(API.post<AdminPayment>(`${ADMIN}/record`, body, withIdempotency(key))),
	updateStatus: (id: string, body: UpdatePaymentStatusBody) => withMessages(API.patch<AdminPayment>(`${ADMIN}/${id}/status`, body)),
	reverse: (id: string, reason: string) => withMessages(API.patch<AdminPayment>(`${ADMIN}/${id}/reverse`, { reason })),
};
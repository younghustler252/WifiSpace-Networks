import { API } from "@/lib/api/api-client";
import type { InitPaymentBody, InitPaymentResult, Payment, VerifyPaymentResult } from "../types/payments.types";

export const paymentsApi = {
	init: (body: InitPaymentBody) => API.post<InitPaymentResult>("/payments", body),
	verify: (reference: string) => API.get<VerifyPaymentResult>(`/payments/verify/${encodeURIComponent(reference)}`),
	listMine: (params: { page?: number; limit?: number }) => API.get<Payment[]>("/payments/me", { params }),
};
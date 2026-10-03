import type { AdminPayment } from "../types/payments.types";

export function paymentTotal(payment: AdminPayment) {
	return typeof payment.amount === "number" ? payment.amount : (payment.amount?.total ?? 0);
}

export function paymentDiscount(payment: AdminPayment) {
	return typeof payment.amount === "object" && payment.amount ? payment.amount.discount : 0;
}

export function paymentDateOf(payment: AdminPayment) {
	return payment.paymentDate ?? payment.processedAt ?? payment.createdAt ?? null;
}

export function isSettlable(payment: AdminPayment) {
	return payment.status === "pending" || payment.status === "initiated";
}
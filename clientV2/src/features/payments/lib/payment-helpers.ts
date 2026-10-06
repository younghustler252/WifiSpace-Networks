import { formatMac } from "@/lib/format";
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

export function getProvisioning(payment: AdminPayment) {
	const raw = payment.metadata?.provisioning;
	if (!raw || typeof raw !== "object") return null;

	const p = raw as Record<string, unknown>;
	const read = (key: string) => (typeof p[key] === "string" ? (p[key] as string) : null);
	const mac = read("macAddress");

	return {
		routerId: read("routerId"),
		macAddress: mac ? formatMac(mac) : null,
		ipAddress: read("ipAddress"),
	};
}

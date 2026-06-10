// src/components/account/hooks/useAccountPayments.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { paymentApi, Payment } from "@/lib/api/payment";

export function useAccountPayments(accountId: string) {
	const { data, error, isLoading, refetch } = useQuery({
		queryKey: ["payments", accountId],
		queryFn: () => paymentApi.getAll({ accountId, limit: 50 }),
		enabled: !!accountId,
		staleTime: 1000 * 60 * 5,
	});

	const payments: Payment[] = data?.data?.data ?? [];

	const totalAmount = payments.reduce((sum, p) => sum + (p.amount?.total || 0), 0);

	const lastPayment = payments.sort(
		(a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
	)[0];

	return {
		payments,
		totalAmount,
		lastPayment,
		isLoading,
		error,
		refetch,
	};
}
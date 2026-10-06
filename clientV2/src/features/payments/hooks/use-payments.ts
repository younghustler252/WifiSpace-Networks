"use client";

import { useEffect } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePollWindow } from "@/hooks/use-poll-window";
import { unwrap } from "@/lib/api/unwrap";
import { adminPaymentsApi, paymentsApi } from "../services/payments.api";
import type { AdminPaymentListParams, UpdatePaymentStatusBody } from "../types/payments.types";

const VERIFY_POLL_MS = 2500;
const VERIFY_MAX_WAIT_MS = 30_000;
const HISTORY_PAGE_SIZE = 10;

export const ADMIN_PAYMENTS_KEY = ["payments", "admin"] as const;
const ADMIN_PAGE_SIZE = 12;


export function useStartPayment() {
	return useMutation({ mutationFn: paymentsApi.init });
}

export function usePayments(page: number) {
	return useQuery({
		queryKey: ["payments", "me", page],
		queryFn: async () => {
			const res = unwrap(await paymentsApi.listMine({ page, limit: HISTORY_PAGE_SIZE }));
			return { items: res.data, meta: res.meta };
		},
		placeholderData: keepPreviousData,
	});
}

export function usePaymentVerification(reference: string | null) {
	const queryClient = useQueryClient();
	const poll = usePollWindow(VERIFY_MAX_WAIT_MS);

	const query = useQuery({
		queryKey: ["payments", "verify", reference],
		enabled: !!reference,
		queryFn: async () => unwrap(await paymentsApi.verify(reference!)).data,
		refetchInterval: (q) => {
			const status = q.state.data?.status;
			if (status === "successful" || status === "failed") return false;
			return poll.isOpen() ? VERIFY_POLL_MS : false;
		},
		retry: false,
		staleTime: 0,
		gcTime: 0,
	});

	const successful = query.data?.status === "successful";
	const failed = query.data?.status === "failed";

	useEffect(() => {
		if (!successful) return;
		queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
		queryClient.invalidateQueries({ queryKey: ["usage"] });
		queryClient.invalidateQueries({ queryKey: ["payments", "me"] });
	}, [successful, queryClient]);

	return {
		successful,
		failed,
		timedOut: poll.expired && !successful && !failed,
		restart: () => {
			poll.restart();
			query.refetch();
		},
	};
}


export function useAdminPayments(params: AdminPaymentListParams) {
	return useQuery({
		queryKey: [...ADMIN_PAYMENTS_KEY, params],
		queryFn: async () => {
			const res = unwrap(await adminPaymentsApi.list({ limit: ADMIN_PAGE_SIZE, ...params }));
			return { items: res.data, meta: res.meta };
		},
		placeholderData: keepPreviousData,
	});
}

function useRefreshAfterPaymentChange() {
	const queryClient = useQueryClient();

	return () => {
		queryClient.invalidateQueries({ queryKey: ADMIN_PAYMENTS_KEY });
		queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
		queryClient.invalidateQueries({ queryKey: ["dashboard"] });
	};
}


export function useAdminPaymentDetail(id: string) {
	return useQuery({
		queryKey: [...ADMIN_PAYMENTS_KEY, "detail", id],
		queryFn: async () => unwrap(await adminPaymentsApi.get(id)).data,
		staleTime: 60_000,
	});
}


export function useRecordPayment() {
	const refresh = useRefreshAfterPaymentChange();

	return useMutation({
		mutationFn: adminPaymentsApi.record,
		onSuccess: (res) => {
			if (res.success) refresh();
		},
	});
}

export function useUpdatePaymentStatus() {
	const refresh = useRefreshAfterPaymentChange();

	return useMutation({
		mutationFn: (v: { id: string; body: UpdatePaymentStatusBody }) => adminPaymentsApi.updateStatus(v.id, v.body),
		onSuccess: (res) => {
			if (res.success) refresh();
		},
	});
}



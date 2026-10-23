"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { unwrap } from "@/lib/api/unwrap";
import { adminWalletApi, walletApi } from "../services/wallet.api";
import type { AdjustWalletBody, PayWithWalletBody } from "../types/wallet.types";

const PAGE_SIZE = 10;

export const WALLET_KEY = ["wallet"] as const;

export function useWallet(enabled = true) {
	return useQuery({
		queryKey: [...WALLET_KEY, "me"],
		enabled,
		queryFn: async () => unwrap(await walletApi.me()).data,
		staleTime: 30_000,
	});
}

export function useWalletTransactions(page: number, limit = PAGE_SIZE) {
	return useQuery({
		queryKey: [...WALLET_KEY, "me", "transactions", page, limit],
		queryFn: async () => {
			const res = unwrap(await walletApi.transactions({ page, limit }));
			return { items: res.data, meta: res.meta };
		},
		placeholderData: keepPreviousData,
	});
}

export function useCreateVirtualAccount() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () => walletApi.virtualAccount(),
		onSuccess: (res) => {
			if (res.success) queryClient.setQueryData([...WALLET_KEY, "me"], res.data);
		},
	});
}

export function usePayWithWallet() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ idempotencyKey, ...body }: PayWithWalletBody & { idempotencyKey?: string }) => walletApi.pay(body, idempotencyKey),
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: WALLET_KEY });
			queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
			queryClient.invalidateQueries({ queryKey: ["usage"] });
			queryClient.invalidateQueries({ queryKey: ["payments"] });
		},
	});
}

export function useAdminWallet(userId: string) {
	return useQuery({
		queryKey: [...WALLET_KEY, "admin", userId],
		queryFn: async () => unwrap(await adminWalletApi.get(userId)).data,
		staleTime: 15_000,
	});
}

export function useAdminWalletTransactions(userId: string, page: number, limit = 5) {
	return useQuery({
		queryKey: [...WALLET_KEY, "admin", userId, "transactions", page, limit],
		queryFn: async () => {
			const res = unwrap(await adminWalletApi.transactions(userId, { page, limit }));
			return { items: res.data, meta: res.meta };
		},
		placeholderData: keepPreviousData,
	});
}

export function useAdjustWallet(userId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ idempotencyKey, ...body }: AdjustWalletBody & { idempotencyKey?: string }) => adminWalletApi.adjust(userId, body, idempotencyKey),
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: [...WALLET_KEY, "admin", userId] });
			queryClient.invalidateQueries({ queryKey: ["audit"] });
		},
	});
}

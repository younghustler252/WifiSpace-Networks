"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { unwrap } from "@/lib/api/unwrap";
import type { ApiResponse } from "@/types/api-response";
import { accountsApi, adminAccountsApi } from "../services/accounts.api";
import type { AdminAccountListParams, ChangeWsnIdBody, UpdateAccountBody } from "../types/accounts.types";


export const ACCOUNTS_KEY = ["accounts", "me"] as const;
export const ADMIN_ACCOUNTS_KEY = ["accounts", "admin"] as const;
const ADMIN_PAGE_SIZE = 12;

export function useAccounts() {
	return useQuery({
		queryKey: ACCOUNTS_KEY,
		queryFn: async () => unwrap(await accountsApi.listMine()).data,
	});
}

export function useAccount(id: string) {
	return useQuery({
		queryKey: [...ACCOUNTS_KEY, id],
		queryFn: async () => unwrap(await accountsApi.getMine(id)).data,
	});
}

export function useRequestAccount() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: accountsApi.request,
		onSuccess: (res) => {
			if (res.success) queryClient.invalidateQueries({ queryKey: ACCOUNTS_KEY });
		},
	});
}

export function useAddDevice(accountId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (body: { macAddress: string; hostname?: string }) => accountsApi.addDevice(accountId, body),
		onSuccess: (res) => {
			if (res.success) queryClient.invalidateQueries({ queryKey: ACCOUNTS_KEY });
		},
	});
}

export function useRemoveDevice(accountId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (mac: string) => accountsApi.removeDevice(accountId, mac),
		onSuccess: (res) => {
			if (res.success) queryClient.invalidateQueries({ queryKey: ACCOUNTS_KEY });
		},
	});
}
export function useAdminAccounts(params: AdminAccountListParams, enabled = true) {
	return useQuery({
		queryKey: [...ADMIN_ACCOUNTS_KEY, params],
		enabled,
		queryFn: async () => {
			const res = unwrap(await adminAccountsApi.list({ limit: ADMIN_PAGE_SIZE, ...params }));
			return { items: res.data, meta: res.meta };
		},
		placeholderData: keepPreviousData,
	});
}

function useAdminAccountAction<TArg>(mutationFn: (arg: TArg) => Promise<ApiResponse<unknown>>) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn,
		onSuccess: (res) => {
			if (!res.success) return;
			queryClient.invalidateQueries({ queryKey: ADMIN_ACCOUNTS_KEY });
			queryClient.invalidateQueries({ queryKey: ["dashboard"] });
			queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
		},
	});
}

export function useAdminAccountActions() {
	return {
		create: useAdminAccountAction(adminAccountsApi.create),
		update: useAdminAccountAction((v: { id: string; body: UpdateAccountBody }) => adminAccountsApi.update(v.id, v.body)),
		approve: useAdminAccountAction((v: { id: string; routerId?: string }) =>
			adminAccountsApi.approve(v.id, { routerId: v.routerId })
		),
		reject: useAdminAccountAction((v: { id: string; note: string }) => adminAccountsApi.reject(v.id, v.note)),
		suspend: useAdminAccountAction(adminAccountsApi.suspend),
		pause: useAdminAccountAction((v: { id: string; note?: string }) => adminAccountsApi.pause(v.id, v.note)),
		resume: useAdminAccountAction(adminAccountsApi.resume),
		terminate: useAdminAccountAction((v: { id: string; note?: string }) => adminAccountsApi.terminate(v.id, v.note)),
		changeWsnId: useAdminAccountAction((v: { id: string; body: ChangeWsnIdBody }) => adminAccountsApi.changeWsnId(v.id, v.body)),
		revealCredentials: useAdminAccountAction((id: string) => adminAccountsApi.routerCredentials(id)),
		setRouterPassword: useAdminAccountAction((v: { id: string; password?: string }) => adminAccountsApi.setRouterPassword(v.id, v.password)),
	};
}
export function useAdminAccount(id: string) {
	return useQuery({
		queryKey: [...ADMIN_ACCOUNTS_KEY, "detail", id],
		queryFn: async () => unwrap(await adminAccountsApi.get(id)).data,
	});
}
import {
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";

import { accountApi } from "../api/account.api";

import type {
	CreateAccountDto,
	UpdateMyAccountDto,
} from "../api/account.types";

// ====================ac==================
// QUERY KEYS
// ======================================

export const accountKeys = {
	all: ["accounts"] as const,

	detail: (id: string) =>
		["accounts", id] as const,
};

// ======================================
// MY ACCOUNTS
// ======================================

export function useMyAccounts() {
	return useQuery({
		queryKey: accountKeys.all,
		queryFn: accountApi.getMyAccounts,
		select: (response) => response.data,
	});
}

// ======================================
// MY ACCOUNT
// ======================================

export function useMyAccount(accountId?: string) {
	return useQuery({
		queryKey: accountId
			? accountKeys.detail(accountId)
			: ["account-detail"],
		queryFn: () =>
			accountApi.getMyAccount(accountId!),
		select: (response) => response.data,
		enabled: !!accountId,
	});
}

// ======================================
// REQUEST ACCOUNT
// ======================================

export function useRequestAccount() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateAccountDto) =>
			accountApi.requestAccount(data),

		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: accountKeys.all,
			});
		},
	});
}

// ======================================
// UPDATE MY ACCOUNT
// ======================================

export function useUpdateMyAccount() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			id,
			data,
		}: {
			id: string;
			data: UpdateMyAccountDto;
		}) =>
			accountApi.updateMyAccount(id, data),

		onSuccess: (response, variables) => {
			queryClient.invalidateQueries({
				queryKey: accountKeys.all,
			});

			if (response.data) {
				queryClient.setQueryData(
					accountKeys.detail(variables.id),
					response.data
				);
			}
		},
	});
}
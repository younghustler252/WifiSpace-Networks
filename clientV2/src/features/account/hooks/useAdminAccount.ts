import {
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";

import { accountApi } from "../api/account.api";

import type {
	CreateAccountDto,
	UpdateAccountDto,
	RejectAccountDto,
	TransferAccountDto,
	ChangeAccountPasswordDto,
	GetAllAccountsParams,
} from "../api/account.types";

// ======================================
// QUERY KEYS
// ======================================

export const adminAccountKeys = {
	all: ["admin-accounts"] as const,

	list: (params?: GetAllAccountsParams) =>
		["admin-accounts", "list", params] as const,

	detail: (id: string) =>
		["admin-accounts", id] as const,

	stats: ["admin-accounts", "stats"] as const,
};

// ======================================
// LIST ACCOUNTS
// ======================================

export function useAdminAccounts(
	params?: GetAllAccountsParams
) {
	return useQuery({
		queryKey: adminAccountKeys.list(params),
		queryFn: () =>
			accountApi.getAllAccounts(params),
		select: (response) => response,
	});
}

// ======================================
// GET ACCOUNT
// ======================================

export function useAdminAccount(accountId?: string) {
	return useQuery({
		queryKey: accountId
			? adminAccountKeys.detail(accountId)
			: ["admin-account-detail"],

		queryFn: () =>
			accountApi.getAccountById(accountId!),

		select: (response) => response.data,

		enabled: !!accountId,
	});
}

// ======================================
// GET ACCOUNT STATS
// ======================================

export function useAdminAccountStats() {
	return useQuery({
		queryKey: adminAccountKeys.stats,
		queryFn: accountApi.getAccountStats,
		select: (response) => response.data,
	});
}

// ======================================
// CREATE ACCOUNT
// ======================================

export function useCreateAccount() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateAccountDto) =>
			accountApi.createAccount(data),

		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: adminAccountKeys.all,
			});
		},
	});
}

// ======================================
// UPDATE ACCOUNT
// ======================================

export function useUpdateAccount() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			id,
			data,
		}: {
			id: string;
			data: UpdateAccountDto;
		}) =>
			accountApi.updateAccount(id, data),

		onSuccess: (response, variables) => {
			queryClient.invalidateQueries({
				queryKey: adminAccountKeys.all,
			});

			if (response.data) {
				queryClient.setQueryData(
					adminAccountKeys.detail(variables.id),
					response.data
				);
			}
		},
	});
}

// ======================================
// APPROVE ACCOUNT
// ======================================

export function useApproveAccount() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (accountId: string) =>
			accountApi.approveAccount(accountId),

		onSuccess: (response, accountId) => {
			queryClient.invalidateQueries({
				queryKey: adminAccountKeys.all,
			});

			if (response.data) {
				queryClient.setQueryData(
					adminAccountKeys.detail(accountId),
					response.data
				);
			}
		},
	});
}

// ======================================
// REJECT ACCOUNT
// ======================================

export function useRejectAccount() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			accountId,
			data,
		}: {
			accountId: string;
			data: RejectAccountDto;
		}) =>
			accountApi.rejectAccount(accountId, data),

		onSuccess: (response, variables) => {
			queryClient.invalidateQueries({
				queryKey: adminAccountKeys.all,
			});

			if (response.data) {
				queryClient.setQueryData(
					adminAccountKeys.detail(variables.accountId),
					response.data
				);
			}
		},
	});
}

// ======================================
// SUSPEND ACCOUNT
// ======================================

export function useSuspendAccount() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (accountId: string) =>
			accountApi.suspendAccount(accountId),

		onSuccess: (response, accountId) => {
			queryClient.invalidateQueries({
				queryKey: adminAccountKeys.all,
			});

			if (response.data) {
				queryClient.setQueryData(
					adminAccountKeys.detail(accountId),
					response.data
				);
			}
		},
	});
}

// ======================================
// TRANSFER ACCOUNT
// ======================================

export function useTransferAccount() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			accountId,
			data,
		}: {
			accountId: string;
			data: TransferAccountDto;
		}) =>
			accountApi.transferAccount(accountId, data),

		onSuccess: (response, variables) => {
			queryClient.invalidateQueries({
				queryKey: adminAccountKeys.all,
			});

			if (response.data) {
				queryClient.setQueryData(
					adminAccountKeys.detail(variables.accountId),
					response.data
				);
			}
		},
	});
}

// ======================================
// CHANGE ROUTER PASSWORD
// ======================================

export function useChangeAccountPassword() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			accountId,
			data,
		}: {
			accountId: string;
			data: ChangeAccountPasswordDto;
		}) =>
			accountApi.changeAccountPassword(accountId, data),

		onSuccess: (response, variables) => {
			queryClient.invalidateQueries({
				queryKey: adminAccountKeys.all,
			});

			if (response.data) {
				queryClient.setQueryData(
					adminAccountKeys.detail(variables.accountId),
					response.data
				);
			}
		},
	});
}

// ======================================
// DELETE ACCOUNT
// ======================================

export function useDeleteAccount() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (accountId: string) =>
			accountApi.deleteAccount(accountId),

		onSuccess: (_, accountId) => {
			queryClient.invalidateQueries({
				queryKey: adminAccountKeys.all,
			});

			queryClient.removeQueries({
				queryKey: adminAccountKeys.detail(accountId),
			});
		},
	});
}
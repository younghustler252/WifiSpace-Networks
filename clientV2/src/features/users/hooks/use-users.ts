"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import type { AuthUser } from "@/features/auth/types/auth.types";
import { unwrap } from "@/lib/api/unwrap";
import { getHomePath } from "@/lib/navigation";
import { useAuthStore } from "@/stores/auth.store";
import type { ApiResponse } from "@/types/api-response";
import type { Role } from "@/types/roles";
import { adminUsersApi, usersApi } from "../services/users.api";
import type { AdminUpdateUserBody, ThemePreference, UserListParams } from "../types/users.types";

export const PROFILE_KEY = ["users", "me"] as const;
export const ADMIN_USERS_KEY = ["users", "admin"] as const;
const ADMIN_PAGE_SIZE = 12;

export function useProfile() {
	return useQuery({
		queryKey: PROFILE_KEY,
		queryFn: async () => unwrap(await usersApi.me()).data,
	});
}

export function useUpdateProfile() {
	const queryClient = useQueryClient();
	const setUser = useAuthStore((s) => s.setUser);

	return useMutation({
		mutationFn: usersApi.updateMe,
		onSuccess: (res) => {
			if (!res.success) return;
			queryClient.setQueryData(PROFILE_KEY, res.data);
			setUser(res.data);
		},
	});
}

export function useUploadAvatar() {
	const queryClient = useQueryClient();
	const setUser = useAuthStore((s) => s.setUser);

	return useMutation({
		mutationFn: usersApi.uploadAvatar,
		onSuccess: (res) => {
			if (!res.success) return;
			queryClient.setQueryData(PROFILE_KEY, res.data);
			setUser(res.data);
		},
	});
}

export function useChangePassword() {
	return useMutation({ mutationFn: usersApi.changePassword });
}

export function useThemePreference() {
	const { theme, setTheme } = useTheme();
	const queryClient = useQueryClient();
	const user = useAuthStore((s) => s.user);
	const setUser = useAuthStore((s) => s.setUser);

	function change(next: ThemePreference) {
		setTheme(next);
		if (!user || user.theme === next) return;

		setUser({ ...user, theme: next });
		usersApi.updateMe({ theme: next }).then((res) => {
			if (res.success) queryClient.setQueryData(PROFILE_KEY, res.data);
		});
	}

	return { theme: (theme ?? "system") as ThemePreference, change };
}


export function useAdminUsers(params: Omit<UserListParams, "limit">) {
	return useQuery({
		queryKey: [...ADMIN_USERS_KEY, params],
		queryFn: async () => {
			const res = unwrap(await adminUsersApi.list({ ...params, limit: ADMIN_PAGE_SIZE }));
			return { items: res.data, meta: res.meta };
		},
		placeholderData: keepPreviousData,
	});
}

function useAdminUserAction<TArg>(mutationFn: (arg: TArg) => Promise<ApiResponse<unknown>>) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn,
		onSuccess: (res) => {
			if (res.success) queryClient.invalidateQueries({ queryKey: ADMIN_USERS_KEY });
		},
	});
}

export function useAdminUserActions() {
	return {
		create: useAdminUserAction(adminUsersApi.create),
		update: useAdminUserAction((v: { id: string; body: AdminUpdateUserBody }) => adminUsersApi.update(v.id, v.body)),
		setRole: useAdminUserAction((v: { id: string; role: Role }) => adminUsersApi.setRole(v.id, v.role)),
		ban: useAdminUserAction((v: { id: string; reason?: string }) => adminUsersApi.ban(v.id, v.reason)),
		unban: useAdminUserAction(adminUsersApi.unban),
		setPassword: useAdminUserAction((v: { id: string; newPassword: string }) => adminUsersApi.setPassword(v.id, v.newPassword)),
		remove: useAdminUserAction(adminUsersApi.remove),
	};
}

export function useImpersonation() {
	const router = useRouter();
	const queryClient = useQueryClient();
	const startInStore = useAuthStore((s) => s.startImpersonation);
	const stopInStore = useAuthStore((s) => s.stopImpersonation);

	async function start(userId: string) {
		const res = await adminUsersApi.impersonate(userId);
		if (!res.success) return res;

		const target: AuthUser = res.data.impersonating;
		startInStore(res.data.accessToken, target);
		queryClient.resetQueries();
		router.push(getHomePath(target.role));
		return res;
	}

	function stop() {
		stopInStore();
		queryClient.resetQueries();
		router.push("/admin/users");
	}

	return { start, stop };
}

export function useAdminUser(id: string | undefined, enabled = true) {
	return useQuery({
		queryKey: [...ADMIN_USERS_KEY, "detail", id],
		enabled: !!id && enabled,
		queryFn: async () => unwrap(await adminUsersApi.get(id!)).data,
		staleTime: 5 * 60_000,
	});
}
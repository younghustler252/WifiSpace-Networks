"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { getHomePath, safeNextPath } from "@/lib/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { SESSION_QUERY_KEY } from "../constants";
import { authApi } from "../services/auth.api";
import type { AuthSession } from "../types/auth.types";
import { useTheme } from "next-themes";

export function useCompleteAuth() {
	const router = useRouter();
	const params = useSearchParams();
	const queryClient = useQueryClient();
	const { setTheme } = useTheme();
	const setUser = useAuthStore((s) => s.setUser);

	return (session: AuthSession) => {
		setUser(session.user);
		if (session.user.theme) setTheme(session.user.theme);
		queryClient.setQueryData(SESSION_QUERY_KEY, session.user);
		router.replace(safeNextPath(params.get("next")) ?? getHomePath(session.user.role));
	};
}

export function useLogout() {
	const router = useRouter();
	const queryClient = useQueryClient();
	const clear = useAuthStore((s) => s.clear);

	return async () => {
		await authApi.logout();
		clear();
		queryClient.clear();
		router.replace("/login");
	};
}
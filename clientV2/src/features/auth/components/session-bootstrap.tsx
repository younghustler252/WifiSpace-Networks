"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { authApi } from "../services/auth.api";
import { SESSION_QUERY_KEY } from "../constants";
import { unwrap } from "@/lib/api/unwrap";
import { useAuthStore } from "@/stores/auth.store";
import { useTheme } from "next-themes";

export function SessionBootstrap() {
	const pathname = usePathname();
	const { setTheme } = useTheme();
	const setUser = useAuthStore((s) => s.setUser);
	const clear = useAuthStore((s) => s.clear);
	const isPortal = pathname.startsWith("/portal");

	const { data, isSuccess, isError } = useQuery({
		queryKey: SESSION_QUERY_KEY,
		queryFn: async () => unwrap(await authApi.me()).data,
		enabled: !isPortal,
		retry: false,
		staleTime: Infinity,
	});

	useEffect(() => {
		if (isSuccess && data) {
			setUser(data);
			if (data.theme) setTheme(data.theme);
		}
		if (isError) clear();
	}, [isSuccess, isError, data, setUser, setTheme, clear]);

	return null;
}
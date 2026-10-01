"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { FullPageLoader } from "@/components/feedback/full-page-loader";
import { getHomePath } from "@/lib/navigation";
import { useAuthStore } from "@/stores/auth.store";
import type { Role } from "@/types/roles";

interface AuthGuardProps {
	children: React.ReactNode;
	allow?: Role[];
}

export function AuthGuard({ children, allow }: AuthGuardProps) {
	const router = useRouter();
	const pathname = usePathname();
	const status = useAuthStore((s) => s.status);
	const user = useAuthStore((s) => s.user);

	const forbidden = !!(user && allow && !allow.includes(user.role));

	useEffect(() => {
		if (status === "guest") {
			router.replace(`/login?next=${encodeURIComponent(pathname)}`);
		} else if (forbidden && user) {
			router.replace(getHomePath(user.role));
		}
	}, [status, forbidden, user, pathname, router]);

	if (status !== "authenticated" || forbidden) return <FullPageLoader />;
	return <>{children}</>;
}
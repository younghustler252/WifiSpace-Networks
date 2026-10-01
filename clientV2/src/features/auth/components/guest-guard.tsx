"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { FullPageLoader } from "@/components/feedback/full-page-loader";
import { getHomePath } from "@/lib/navigation";
import { useAuthStore } from "@/stores/auth.store";

export function GuestGuard({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	const status = useAuthStore((s) => s.status);
	const user = useAuthStore((s) => s.user);

	useEffect(() => {
		if (status === "authenticated" && user) router.replace(getHomePath(user.role));
	}, [status, user, router]);

	if (status === "authenticated") return <FullPageLoader />;
	return <>{children}</>;
}
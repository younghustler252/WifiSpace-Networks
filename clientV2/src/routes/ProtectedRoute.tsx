"use client";

import { ReactNode, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { FullScreenLoader } from "@/components/ui/Loader";

interface Props {
	children: ReactNode;
	allowedRoles?: string[];
	redirectPath?: string;
}

export default function ProtectedRoute({
	children,
	allowedRoles,
	redirectPath = "/",
}: Props) {
	const { user, loading, isAuthenticated } = useAuth();
	const router = useRouter();
	const hasRedirected = useRef(false);

	useEffect(() => {
		if (loading || hasRedirected.current) return;

		// 1️⃣ Not logged in → login
		if (!isAuthenticated) {
			hasRedirected.current = true;
			router.replace("/auth/login");
			return;
		}

		// 2️⃣ Not verified → verify page
		if (!user?.isVerified) {
			hasRedirected.current = true;
			router.replace("/auth/verify");
			return;
		}

		// 3️⃣ Role restriction
		if (allowedRoles && !allowedRoles.includes(user?.role || "")) {
			hasRedirected.current = true;
			router.replace(redirectPath);
			return;
		}
	}, [loading, isAuthenticated, user, allowedRoles, router, redirectPath]);

	// 🔄 While checking auth
	if (loading) {
		return <FullScreenLoader />;
	}

	// ⛔ Block UI while redirecting
	if (
		!isAuthenticated ||
		!user?.isVerified ||
		(allowedRoles && !allowedRoles.includes(user?.role || ""))
	) {
		return null;
	}

	// ✅ Allowed
	return <>{children}</>;
}
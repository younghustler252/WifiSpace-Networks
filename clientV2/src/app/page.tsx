"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { FullScreenLoader } from "@/components/ui/Loader";

export default function Home() {
	const { user, loading, isAuthenticated } = useAuth();
	const router = useRouter();
	const hasRedirected = useRef(false);

	useEffect(() => {
		if (loading || hasRedirected.current) return;

		// 1️⃣ Not logged in
		if (!isAuthenticated) {
			hasRedirected.current = true;
			router.replace("/auth/login");
			return;
		}

		// 2️⃣ Not verified
		if (!user?.isVerified) {
			hasRedirected.current = true;
			router.replace("/auth/verify");
			return;
		}

		// 3️⃣ Role-based redirect
		hasRedirected.current = true;

		switch (user?.role) {
			case "superadmin":
				router.replace("/admin/dashboard");
				break;
			case "staff":
				router.replace("/staff/dashboard");
				break;
			default:
				router.replace("/customer/dashboard");
		}
	}, [loading, isAuthenticated, user, router]);

	return (
		<div className="h-screen flex items-center justify-center">
			<FullScreenLoader />
		</div>
	);
}
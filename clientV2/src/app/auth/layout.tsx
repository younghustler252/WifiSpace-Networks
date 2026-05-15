"use client";

import React, { useEffect } from "react";
import Logo from "@/components/ui/Logo";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function AuthLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const { user, isAuthenticated, loading } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (loading) return;

		if (isAuthenticated && user?.isVerified) {
			router.replace("/");
		}
	}, [loading, isAuthenticated, user, router]);

	return (
		<div className="min-h-screen flex items-center justify-center bg-background px-6 py-12">

			<div className="w-full max-w-5xl grid lg:grid-cols-2 gap-10 items-center">

				{/* LEFT — SYSTEM INFO */}
				<div className="hidden lg:flex flex-col justify-center">

					<Logo size="lg" showText />

					<h2 className="mt-8 text-3xl font-semibold tracking-tight leading-tight">
						Network Control Panel
					</h2>

					<p className="mt-3 text-muted-foreground max-w-md">
						Manage accounts, subscriptions, billing, and router sessions in one system.
					</p>

					<div className="ui-divider mt-8 w-24" />

					<p className="mt-4 text-sm text-muted-foreground">
						Internal ISP operations system
					</p>

				</div>

				{/* RIGHT — AUTH */}
				<div className="flex items-center justify-center">
					<div className="w-full max-w-md ui-stack-lg">

						{/* Mobile Logo */}
						<div className="lg:hidden flex justify-center">
							<Logo size="md" showText />
						</div>

						{/* AUTH CARD */}
						<div className="ui-card p-8">
							{children}
						</div>

					</div>
				</div>

			</div>

		</div>
	);
}
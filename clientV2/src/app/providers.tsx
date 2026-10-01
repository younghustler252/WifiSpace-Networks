"use client";

import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { SessionBootstrap } from "@/features/auth/components/session-bootstrap";
import { ImpersonationBanner } from "@/features/users/components/impersonation-banner";
import { makeQueryClient } from "@/lib/api/query-client";

export function Providers({ children }: { children: React.ReactNode }) {
	const [queryClient] = useState(makeQueryClient);

	return (
		<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
			<QueryClientProvider client={queryClient}>
				<SessionBootstrap />
				{children}
				<ImpersonationBanner />
				<Toaster richColors position="top-center" />
			</QueryClientProvider>
		</ThemeProvider>
	);
}
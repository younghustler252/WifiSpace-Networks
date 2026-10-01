"use client";

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth.store";
import { useImpersonation } from "../hooks/use-users";

export function ImpersonationBanner() {
	const impersonation = useAuthStore((s) => s.impersonation);
	const { stop } = useImpersonation();

	if (!impersonation) return null;
	const { target } = impersonation;

	return (
		<>
			<div className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-1 bg-warning" />
			<div
				role="status"
				className="fixed bottom-20 left-1/2 z-[60] flex max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-3 rounded-full border border-warning/40 bg-background/95 py-1.5 pl-4 pr-1.5 text-[12px] shadow-lg backdrop-blur lg:bottom-4"
			>
				<span className="truncate">
					Viewing as{" "}
					<strong className="font-semibold">
						{target.firstName} {target.lastName}
					</strong>
				</span>
				<Button size="sm" variant="outline" className="shrink-0 rounded-full" onClick={stop}>
					Exit
				</Button>
			</div>
		</>
	);
}
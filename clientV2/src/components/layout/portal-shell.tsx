import { ShieldCheck } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { SupportFooterLink } from "@/features/hotspots/components/support-link";
import { buildSupportMessage } from "@/features/hotspots/lib/support";

export function PortalShell({ children }: { children: React.ReactNode }) {
	return (
		<div className="relative flex min-h-svh flex-col overflow-x-hidden bg-background text-foreground">
			<div className="pointer-events-none absolute inset-x-0 top-0 h-72 grid-bg opacity-30 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
			<div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-signal/15 blur-3xl" />

			<header className="relative mx-auto flex w-full max-w-md items-center justify-between px-4 py-5">
				<Logo size="sm" />
				<span className="inline-flex items-center gap-1.5 rounded-full border border-signal/30 bg-signal/10 px-2.5 py-1 text-[11px] text-signal">
					<span className="status-dot pulse-signal text-signal" />
					Wifi hotspot
				</span>
			</header>

			<main className="relative mx-auto w-full max-w-md flex-1 px-4 pb-6">{children}</main>

			<footer className="relative mx-auto flex w-full max-w-md flex-col items-center gap-1 px-4 pb-5 text-[11px] text-muted-foreground">
				<SupportFooterLink message={buildSupportMessage({ issue: "I have a question." })} />
				<span className="inline-flex items-center gap-1.5">
					<ShieldCheck className="size-3.5" />
					Secure payments by Paystack
				</span>
			</footer>
		</div>
	);
}
import Link from "next/link";
import { Activity, ShieldCheck, Wifi, Zap } from "lucide-react";
import { Logo } from "../shared/logo";
import { company } from "@/config/company";

const BENEFITS = [
	{ icon: Zap, title: "Instant activation", text: "Online right after payment" },
	{ icon: Activity, title: "Live usage", text: "Time and data at a glance" },
	{ icon: Wifi, title: "Home & hotspot", text: "One account for both" },
	{ icon: ShieldCheck, title: "Secure payments", text: "Powered by Paystack" },
];

export function AuthShell({ children }: { children: React.ReactNode }) {
	return (
		<div className="grid min-h-svh bg-background text-foreground lg:grid-cols-2">
			<div className="dark relative hidden flex-col overflow-hidden border-r border-border bg-sidebar text-foreground lg:flex">
				<div className="absolute inset-0 grid-bg opacity-40" />
				<div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-signal/10 blur-3xl" />
				<div className="relative flex h-full flex-col p-8">
					<Link href="/" className="w-fit">
						<Logo />
					</Link>
					<div className="mt-auto max-w-md space-y-6">
						<div className="inline-flex items-center gap-1.5 rounded-full border border-signal/30 bg-signal/10 px-2.5 py-1 text-[11px] text-signal">
							<span className="status-dot pulse-signal text-signal" />
							{company.auth.badge}
						</div>
						<h2 className="text-3xl font-semibold leading-tight tracking-tight">
							{company.auth.headline} <span className="text-signal">{company.auth.highlight}</span>
						</h2>
						<p className="text-sm text-muted-foreground">{company.auth.description}</p>
						<div className="grid grid-cols-2 gap-3 pt-4">
							{BENEFITS.map((b) => (
								<div key={b.title} className="card-elevated bg-surface-2 p-3">
									<b.icon className="size-4 text-signal" />
									<div className="mt-2 text-sm font-medium">{b.title}</div>
									<div className="text-[11px] text-muted-foreground">{b.text}</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>

			<div className="flex items-center justify-center p-6">
				<div className="w-full max-w-sm">
					<div className="mb-8 lg:hidden">
						<Logo />
					</div>
					{children}
				</div>
			</div>
		</div>
	);
}
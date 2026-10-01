"use client";

import Link from "next/link";
import { Bell, LayoutDashboard, Receipt, User, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeaderStatus } from "@/features/accounts/components/header-status";
import { AppShell, type NavGroup } from "./app-shell";

const GROUPS: NavGroup[] = [
	{
		label: "My account",
		items: [
			{ href: "/overview", label: "Overview", icon: LayoutDashboard, mobile: true, also: ["/accounts"] },
			{ href: "/plans", label: "Buy a plan", shortLabel: "Plans", icon: Zap, mobile: true },
			{ href: "/payments", label: "Payments", icon: Receipt, mobile: true },
		],
	},
	{
		label: "Settings",
		items: [
			{ href: "/notifications", label: "Notifications", icon: Bell },
			{ href: "/profile", label: "Profile", icon: User, mobile: true },
		],
	},
];

export function CustomerShell({ children }: { children: React.ReactNode }) {
	return (
		<AppShell
			home="/overview"
			groups={GROUPS}
			headerStart={<HeaderStatus />}
			headerEnd={
				<Button asChild variant="ghost" size="icon">
					<Link href="/notifications" aria-label="Notifications">
						<Bell className="size-4" />
					</Link>
				</Button>
			}
			sidebarFooter={
				<Link href="/accounts/new" className="card-elevated block bg-surface-2 p-3 transition hover:border-signal/40">
					<div className="text-[10px] uppercase tracking-wider text-muted-foreground">New service</div>
					<div className="mt-1 text-[12px]">Add an account →</div>
				</Link>
			}
		>
			{children}
		</AppShell>
	);
}
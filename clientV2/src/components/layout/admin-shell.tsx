"use client";

import {
	CalendarClock,
	ClipboardCheck,
	CreditCard,
	LayoutDashboard,
	Megaphone,
	Network,
	Router as RouterIcon,
	ScrollText,
	Tag,
	Users,
} from "lucide-react";
import { can, type Permission } from "@/lib/rbac";
import { useAuthStore } from "@/stores/auth.store";
import { AppShell, type NavGroup, type NavItem } from "./app-shell";

interface AdminNavItem extends NavItem {
	permission?: Permission;
}

const GROUPS: { label: string; items: AdminNavItem[] }[] = [
	{
		label: "Overview",
		items: [{ href: "/admin/dashboard", label: "Dashboard", shortLabel: "Home", icon: LayoutDashboard, mobile: true }],
	},
	{
		label: "Manage",
		items: [
			{ href: "/admin/approvals", label: "Approvals", icon: ClipboardCheck, mobile: true },
			{ href: "/admin/accounts", label: "Accounts", icon: Network },
			{ href: "/admin/subscriptions", label: "Subscriptions", shortLabel: "Subs", icon: CalendarClock, mobile: true },
			{ href: "/admin/payments", label: "Payments", icon: CreditCard, mobile: true },
			{ href: "/admin/users", label: "Users", icon: Users },
			{ href: "/admin/plans", label: "Plans", icon: Tag },
		],
	},
	{
		label: "System",
		items: [
			{ href: "/admin/routers", label: "Routers", icon: RouterIcon },
			{ href: "/admin/notifications", label: "Broadcasts", icon: Megaphone },
			{ href: "/admin/audit", label: "Audit log", icon: ScrollText },
		],
	},
];


export function AdminShell({ children }: { children: React.ReactNode }) {
	const role = useAuthStore((s) => s.user?.role);

	const groups: NavGroup[] = GROUPS.map((group) => ({
		label: group.label,
		items: group.items.filter((item) => !item.permission || can(role, item.permission)),
	})).filter((group) => group.items.length > 0);

	return (
		<AppShell
			home="/admin/dashboard"
			groups={groups}
			contentClassName="max-w-7xl"
			headerStart={
				role ? (
					<span className="rounded-full border border-signal/30 bg-signal/10 px-2.5 py-0.5 text-[11px] font-medium capitalize text-signal">
						{role}
					</span>
				) : null
			}
		>
			{children}
		</AppShell>
	);
}
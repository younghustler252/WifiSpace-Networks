"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { cn } from "@/lib/utils";
import { UserMenu } from "./user-menu";

export interface NavItem {
	href: string;
	label: string;
	shortLabel?: string;
	icon: LucideIcon;
	mobile?: boolean;
	also?: string[];
}

export interface NavGroup {
	label: string;
	items: NavItem[];
}

interface AppShellProps {
	home: string;
	groups: NavGroup[];
	headerStart?: React.ReactNode;
	headerEnd?: React.ReactNode;
	sidebarFooter?: React.ReactNode;
	contentClassName?: string;
	children: React.ReactNode;
}

export function AppShell({ home, groups, headerStart, headerEnd, sidebarFooter, contentClassName, children }: AppShellProps) {
	const pathname = usePathname();
	const mobileItems = groups.flatMap((g) => g.items).filter((item) => item.mobile);
	const isActive = (item: NavItem) =>
		[item.href, ...(item.also ?? [])].some((base) => pathname === base || pathname.startsWith(`${base}/`));

	return (
		<div className="min-h-svh bg-background text-foreground lg:grid lg:grid-cols-[15rem_1fr]">
			<aside className="sticky top-0 hidden h-svh flex-col border-r bg-sidebar lg:flex">
				<div className="flex h-14 items-center border-b border-sidebar-border px-4">
					<Link href={home}>
						<Logo />
					</Link>
				</div>

				<nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
					{groups.map((group) => (
						<div key={group.label}>
							<div className="px-2 pb-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{group.label}</div>
							<ul className="space-y-0.5">
								{group.items.map((item) => {
									const active = isActive(item);
									return (
										<li key={item.href}>
											<Link
												href={item.href}
												className={cn(
													"flex items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] transition-colors",
													active
														? "bg-sidebar-accent text-sidebar-accent-foreground shadow-[inset_2px_0_0_0] shadow-signal"
														: "text-sidebar-foreground/80 hover:bg-sidebar-accent/60"
												)}
											>
												<item.icon className={cn("size-4", active ? "text-signal" : "text-muted-foreground")} />
												{item.label}
											</Link>
										</li>
									);
								})}
							</ul>
						</div>
					))}
				</nav>

				{sidebarFooter && <div className="border-t border-sidebar-border p-3">{sidebarFooter}</div>}
			</aside>

			<div className="flex min-h-svh min-w-0 flex-col">
				<header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-surface/60 px-4 backdrop-blur md:px-6">
					<Link href={home} className="lg:hidden">
						<Logo size="sm" showName={false} />
					</Link>
					{headerStart}
					<div className="ml-auto flex items-center gap-1">
						{headerEnd}
						<div className="ml-1 border-l pl-2">
							<UserMenu />
						</div>
					</div>
				</header>

				<main className={cn("mx-auto w-full max-w-6xl flex-1 space-y-6 p-4 pb-28 md:p-6 lg:pb-6", contentClassName)}>
					{children}
				</main>

				<nav className="fixed inset-x-0 bottom-0 z-30 grid grid-flow-col auto-cols-fr border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
					{mobileItems.map((item) => (
						<Link
							key={item.href}
							href={item.href}
							className={cn(
								"flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium",
								isActive(item) ? "text-signal" : "text-muted-foreground"
							)}
						>
							<item.icon className="size-5" />
							{item.shortLabel ?? item.label}
						</Link>
					))}
				</nav>
			</div>
		</div>
	);
}
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useThemePreference } from "@/features/users/hooks/use-users";
import type { ThemePreference } from "@/features/users/types/users.types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { can } from "@/lib/rbac";
import { useLogout } from "@/features/auth/hooks/use-auth";
import { useAuthStore } from "@/stores/auth.store";

export function UserMenu() {
	const user = useAuthStore((s) => s.user);
	const logout = useLogout();
	const pathname = usePathname();
	const { theme, change } = useThemePreference();

	const inAdmin = pathname.startsWith("/admin");
	const profileHref = inAdmin ? "/admin/profile" : "/profile";
	const canAdmin = can(user?.role, "admin:access");

	if (!user) return null;
	const initials = `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button
					type="button"
					className="flex items-center gap-2.5 rounded-lg p-1.5 text-left hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
				>
					<Avatar className="size-8">
						<AvatarImage src={user.avatar?.url} alt="" />
						<AvatarFallback className="bg-signal/15 text-[11px] font-semibold text-signal">{initials}</AvatarFallback>
					</Avatar>
					<span className="hidden max-w-40 leading-tight md:block">
						<span className="block truncate text-[12px] font-medium">
							{user.firstName} {user.lastName}
						</span>
						<span className="block truncate text-[10px] text-muted-foreground">{user.email}</span>
					</span>
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-56">
				<DropdownMenuItem asChild>
					<Link href={profileHref}>Profile</Link>
				</DropdownMenuItem>
				{canAdmin && (
					<DropdownMenuItem asChild>
						<Link href={inAdmin ? "/overview" : "/admin/dashboard"}>{inAdmin ? "My WifiSpace" : "Admin console"}</Link>
					</DropdownMenuItem>
				)}
				<DropdownMenuSeparator />
				<DropdownMenuLabel className="text-xs text-muted-foreground">Theme</DropdownMenuLabel>
				<DropdownMenuRadioGroup value={theme} onValueChange={(value) => change(value as ThemePreference)}>
					<DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
					<DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
					<DropdownMenuRadioItem value="system">System</DropdownMenuRadioItem>
				</DropdownMenuRadioGroup>
				<DropdownMenuSeparator />
				<DropdownMenuItem onSelect={logout}>Sign out</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
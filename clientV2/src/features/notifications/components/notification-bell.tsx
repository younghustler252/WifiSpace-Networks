"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUnreadCount } from "../hooks/use-notifications";

export function NotificationBell() {
	const { count, more } = useUnreadCount();
	const label = count > 0 ? `${count}${more ? "+" : ""}` : "";

	return (
		<Button asChild variant="ghost" size="icon" className="relative size-11 md:size-9">
			<Link href="/notifications" aria-label={count > 0 ? `Notifications, ${label} unread` : "Notifications"}>
				<Bell className="size-5 md:size-4" />
				{count > 0 && (
					<span className="absolute right-1 top-1 flex min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-4 text-white ring-2 ring-background">
						{label}
					</span>
				)}
			</Link>
		</Button>
	);
}

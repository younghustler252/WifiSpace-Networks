"use client";

import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminUser } from "../hooks/use-users";

export function UserNameCell({ userId, link = false }: { userId?: string; link?: boolean }) {
	const { data, isLoading } = useAdminUser(userId);

	if (!userId) return <span className="text-muted-foreground">—</span>;
	if (isLoading) return <Skeleton className="h-8 w-36" />;
	if (!data) return <span className="text-mono text-[12px] text-muted-foreground">…{userId.slice(-8)}</span>;

	const name = `${data.firstName} ${data.lastName}`;

	return (
		<div className="min-w-0">
			{link ? (
				<Link href={`/admin/users/${userId}`} className="block truncate text-[13px] font-medium hover:text-signal">
					{name}
				</Link>
			) : (
				<p className="truncate text-[13px] font-medium">{name}</p>
			)}
			<p className="truncate text-[11px] text-muted-foreground">{data.email}</p>
		</div>
	);
}
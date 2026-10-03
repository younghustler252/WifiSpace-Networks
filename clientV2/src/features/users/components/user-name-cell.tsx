"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useAdminUser } from "../hooks/use-users";

export function UserNameCell({ userId }: { userId?: string }) {
	const { data, isLoading } = useAdminUser(userId);

	if (!userId) return <span className="text-muted-foreground">—</span>;
	if (isLoading) return <Skeleton className="h-8 w-36" />;
	if (!data) return <span className="text-mono text-[12px] text-muted-foreground">…{userId.slice(-8)}</span>;

	return (
		<div className="min-w-0">
			<p className="truncate text-[13px] font-medium">
				{data.firstName} {data.lastName}
			</p>
			<p className="truncate text-[11px] text-muted-foreground">{data.email}</p>
		</div>
	);
}
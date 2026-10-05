"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useAdminUser } from "@/features/users/hooks/use-users";
import type { AdminAccount, OwnerInfo } from "../types/accounts.types";

export function useAccountOwner(account: AdminAccount) {
	const embedded: OwnerInfo | null = account.user && (account.user.firstName || account.user.email) ? account.user : null;
	const fetched = useAdminUser(account.userId, !embedded);

	return {
		owner: embedded ?? fetched.data ?? null,
		isLoading: !embedded && fetched.isLoading,
	};
}

export function ownerName(owner: OwnerInfo | null) {
	return owner ? `${owner.firstName ?? ""} ${owner.lastName ?? ""}`.trim() : "";
}

export function OwnerCell({ account }: { account: AdminAccount }) {
	const { owner, isLoading } = useAccountOwner(account);

	if (isLoading) return <Skeleton className="h-8 w-40" />;
	if (!owner) return <span className="text-mono text-[12px] text-muted-foreground">…{account.userId.slice(-8)}</span>;

	return (
		<div className="min-w-0">
			<p className="truncate text-[13px] font-medium">{ownerName(owner) || "Unnamed"}</p>
			<p className="truncate text-[11px] text-muted-foreground">{owner.email}</p>
		</div>
	);
}
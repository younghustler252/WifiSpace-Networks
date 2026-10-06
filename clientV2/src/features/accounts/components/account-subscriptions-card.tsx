"use client";

import Link from "next/link";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAccountSubscriptions } from "@/features/subscriptions/hooks/use-subscriptions";
import { getDisplayStatus, listAccountSubscriptions } from "@/features/subscriptions/lib/subscription-phase";
import { formatCurrency, formatDate } from "@/lib/format";

export function AccountSubscriptionsCard({ accountId }: { accountId: string }) {
	const { data, isLoading, isError } = useAccountSubscriptions(accountId);
	const items = listAccountSubscriptions(data?.items, accountId);

	function renderBody() {
		if (isLoading) return <Skeleton className="h-24 rounded-lg" />;
		if (isError) return <p className="text-[13px] text-muted-foreground">Subscriptions aren&apos;t available right now.</p>;
		if (items.length === 0) return <p className="text-[13px] text-muted-foreground">No plans have been bought for this account yet.</p>;

		return (
			<ul className="divide-y">
				{items.map((s) => {
					const range = [s.startsAt && formatDate(s.startsAt), s.expiresAt && formatDate(s.expiresAt)].filter(Boolean).join(" – ");

					return (
						<li key={s.id}>
							<Link href={`/admin/subscriptions/${s.id}`} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
								<div className="min-w-0">
									<p className="truncate text-[13px] font-medium">
										{s.planSnapshot.name}
										{s.cycles > 1 ? ` × ${s.cycles}` : ""}
									</p>
									{range && <p className="text-[11px] text-muted-foreground">{range}</p>}
								</div>
								<div className="flex flex-col items-end gap-1">
									<span className="text-mono text-[13px]">{formatCurrency(s.totalAmount)}</span>
									<StatusBadge status={getDisplayStatus(s)} />
								</div>
							</Link>
						</li>
					);
				})}
			</ul>
		);
	}

	return (
		<SectionCard title="Subscriptions" description="Every plan on this account, newest first.">
			{renderBody()}
		</SectionCard>
	);
}
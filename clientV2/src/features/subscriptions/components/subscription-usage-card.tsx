"use client";

import { useState } from "react";
import { SectionCard } from "@/components/shared/section-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatsTiles, SubscriptionUsageDialog } from "@/features/usage/components/subscription-usage-dialog";
import { useSubscriptionUsageStats } from "@/features/usage/hooks/use-usage";
import type { Subscription } from "../types/subscriptions.types";

export function SubscriptionUsageCard({ subscription }: { subscription: Subscription }) {
	const [open, setOpen] = useState(false);
	const stats = useSubscriptionUsageStats(subscription.id);

	return (
		<SectionCard
			title="Usage"
			actions={
				<Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
					View records
				</Button>
			}
		>
			{stats.isLoading && <Skeleton className="h-24 rounded-lg" />}
			{stats.isError && <p className="text-[13px] text-muted-foreground">Usage isn&apos;t available right now.</p>}
			{stats.data && <StatsTiles stats={stats.data} />}
			{open && <SubscriptionUsageDialog subscription={subscription} onClose={() => setOpen(false)} />}
		</SectionCard>
	);
}
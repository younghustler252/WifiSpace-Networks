"use client";

import { StatusBadge } from "@/components/shared/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getSubscriptionPhase, pickCurrentSubscription } from "@/features/subscriptions/lib/subscription-phase";
import { useSubscriptions } from "@/features/subscriptions/hooks/use-subscriptions";
import { useCountdown } from "@/hooks/use-countdown";
import { formatRemaining } from "@/lib/format";
import { useAccounts } from "../hooks/use-accounts";

export function HeaderStatus() {
	const accounts = useAccounts();
	const subscriptions = useSubscriptions();

	const approved = (accounts.data ?? []).filter((a) => a.approvalStatus === "approved");
	const entries = approved.map((account) => {
		const subscription = pickCurrentSubscription(subscriptions.data, account.id);
		return { subscription, phase: getSubscriptionPhase(subscription) };
	});
	const current = entries.find((e) => e.phase === "active") ?? entries[0];
	const secondsLeft = useCountdown(current?.subscription?.expiresAt);

	if (accounts.isLoading || subscriptions.isLoading) return <Skeleton className="h-6 w-24 rounded-full" />;
	if (!accounts.data || accounts.data.length === 0) return null;

	if (!current) return <StatusBadge status="pending" label="Awaiting approval" />;

	return (
		<div className="flex items-center gap-2.5">
			<StatusBadge status={current.phase} label={current.phase === "none" ? "No active plan" : undefined} />
			{current.phase === "active" && current.subscription && (
				<span className="text-mono hidden text-[12px] text-muted-foreground md:inline">
					{current.subscription.planSnapshot.name} · {formatRemaining(secondsLeft)} left
				</span>
			)}
		</div>
	);
}
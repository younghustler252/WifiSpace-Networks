"use client";

import Link from "next/link";
import { ChevronLeft, SearchX, WifiOff } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatusMessage } from "@/components/shared/status-message";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SubscriptionHistory } from "@/features/subscriptions/components/subscription-history";
import { useSubscriptions } from "@/features/subscriptions/hooks/use-subscriptions";
import { listAccountSubscriptions, pickCurrentSubscription } from "@/features/subscriptions/lib/subscription-phase";
import { ApiError } from "@/lib/api/unwrap";
import { useAccount } from "../hooks/use-accounts";
import { getAccountTitle } from "../lib/account-meta";
import { AccountCard } from "./account-card";
import { AccountInfo } from "./account-info";
import { DevicesSection } from "./devices-section";

export function AccountDetail({ id }: { id: string }) {
	const account = useAccount(id);
	const subscriptions = useSubscriptions();

	if (account.isLoading || subscriptions.isLoading) {
		return (
			<div className="space-y-6">
				<Skeleton className="h-12 w-64 rounded-lg" />
				<div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
					<Skeleton className="h-96 rounded-xl" />
					<Skeleton className="h-64 rounded-xl" />
				</div>
			</div>
		);
	}

	if (account.isError || subscriptions.isError || !account.data) {
		const notFound = account.error instanceof ApiError && account.error.code === "NOT_FOUND";

		if (notFound) {
			return (
				<StatusMessage icon={SearchX} tone="warning" title="Account not found" text="This account doesn't exist or isn't linked to you.">
					<Button asChild size="lg" className="w-full">
						<Link href="/overview">Back to overview</Link>
					</Button>
				</StatusMessage>
			);
		}

		return (
			<StatusMessage icon={WifiOff} tone="warning" title="We couldn't load this account" text="Check your connection and try again.">
				<Button
					size="lg"
					className="w-full"
					onClick={() => {
						account.refetch();
						subscriptions.refetch();
					}}
				>
					Try again
				</Button>
			</StatusMessage>
		);
	}

	const acc = account.data;
	const current = pickCurrentSubscription(subscriptions.data, acc.id);
	const history = listAccountSubscriptions(subscriptions.data, acc.id);
	const showDevices = acc.serviceType === "hotspot" && acc.approvalStatus === "approved";

	return (
		<div className="space-y-6">
			<div className="space-y-3">
				<Link href="/overview" className="inline-flex items-center gap-1 text-[12px] text-muted-foreground hover:text-foreground">
					<ChevronLeft className="size-4" />
					Overview
				</Link>
				<PageHeader title="Account details" description={`${getAccountTitle(acc)} · ${acc.wsnId}`} />
			</div>

			<div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
				<div className="space-y-4">
					<AccountCard account={acc} subscription={current} showDetailsLink={false} />
					<SubscriptionHistory subscriptions={history} />
				</div>
				<div className="space-y-4">
					<AccountInfo account={acc} />
					{showDevices && <DevicesSection account={acc} />}
				</div>
			</div>
		</div>
	);
}
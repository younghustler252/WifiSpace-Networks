"use client";

import Link from "next/link";
import { Wifi, WifiOff } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatusMessage } from "@/components/shared/status-message";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSubscriptions } from "@/features/subscriptions/hooks/use-subscriptions";
import { pickCurrentSubscription } from "@/features/subscriptions/lib/subscription-phase";
import { useAuthStore } from "@/stores/auth.store";
import { useAccounts } from "../hooks/use-accounts";
import { AccountCard } from "./account-card";
import { QuickActions } from "./quick-actions";

export function AccountOverview() {
	const user = useAuthStore((s) => s.user);
	const accounts = useAccounts();
	const subscriptions = useSubscriptions();

	if (accounts.isLoading || subscriptions.isLoading) {
		return (
			<div className="space-y-6">
				<Skeleton className="h-12 w-64 rounded-lg" />
				<div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
					<Skeleton className="h-80 rounded-xl" />
					<Skeleton className="h-40 rounded-xl" />
				</div>
			</div>
		);
	}

	if (accounts.isError || subscriptions.isError || !accounts.data) {
		return (
			<StatusMessage icon={WifiOff} tone="warning" title="We couldn't load your account" text="Check your connection and try again.">
				<Button
					size="lg"
					className="w-full"
					onClick={() => {
						accounts.refetch();
						subscriptions.refetch();
					}}
				>
					Try again
				</Button>
			</StatusMessage>
		);
	}

	if (accounts.data.length === 0) {
		return (
			<StatusMessage icon={Wifi} title="Let's get you connected" text="Request your first account to get started. It only takes a minute.">
				<Button asChild size="lg" className="w-full">
					<Link href="/accounts/new">Request an account</Link>
				</Button>
			</StatusMessage>
		);
	}

	return (
		<div className="space-y-6">
			<PageHeader title={`Hi, ${user?.firstName ?? "there"}`} description="Your plan, usage and account status." />

			<div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
				<div className="space-y-4">
					{accounts.data.map((account) => (
						<AccountCard key={account.id} account={account} subscription={pickCurrentSubscription(subscriptions.data, account.id)} />
					))}
				</div>
				<QuickActions />
			</div>
		</div>
	);
}
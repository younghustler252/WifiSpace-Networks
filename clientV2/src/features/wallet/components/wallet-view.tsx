"use client";

import { useState } from "react";
import Link from "next/link";
import { Wallet as WalletIcon, WifiOff } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { SimplePagination } from "@/components/shared/simple-pagination";
import { StatusMessage } from "@/components/shared/status-message";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useWallet, useWalletTransactions } from "../hooks/use-wallet";
import { formatWalletAmount } from "../lib/money";
import { FundWalletCard } from "./fund-wallet-card";
import { WalletTransactionList } from "./wallet-transactions";

export function WalletView() {
	const [page, setPage] = useState(1);
	const wallet = useWallet();
	const transactions = useWalletTransactions(page);

	if (wallet.isLoading) {
		return (
			<div className="space-y-6">
				<Skeleton className="h-14 w-56 rounded-lg" />
				<Skeleton className="h-40 rounded-2xl" />
				<Skeleton className="h-56 rounded-xl" />
			</div>
		);
	}

	if (wallet.isError || !wallet.data) {
		return (
			<StatusMessage icon={WifiOff} tone="warning" title="We couldn't load your wallet" text="Check your connection and try again.">
				<Button size="lg" className="w-full" onClick={() => wallet.refetch()}>
					Try again
				</Button>
			</StatusMessage>
		);
	}

	const items = transactions.data?.items ?? [];
	const meta = transactions.data?.meta;

	return (
		<div className="space-y-6">
			<PageHeader title="Wallet" description="Top up once, then pay for plans in one tap." />

			<div className="card-elevated relative overflow-hidden bg-surface-2 p-5">
				<div className="pointer-events-none absolute inset-0 grid-bg opacity-30 [mask-image:linear-gradient(to_bottom_right,black,transparent)]" />
				<div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
					<div>
						<p className="text-[11px] uppercase tracking-wider text-muted-foreground">Available balance</p>
						<p className="text-mono mt-1 text-4xl font-semibold">{formatWalletAmount(wallet.data.balance)}</p>
					</div>
					<Button asChild size="lg" className="w-full sm:w-auto">
						<Link href="/plans">Buy a plan</Link>
					</Button>
				</div>
			</div>

			<div className="grid gap-4 lg:grid-cols-[22rem_minmax(0,1fr)] lg:items-start">
				<FundWalletCard wallet={wallet.data} />

				<SectionCard title="Activity" description={meta ? `${meta.total} transaction${meta.total === 1 ? "" : "s"}` : undefined} className={transactions.isPlaceholderData ? "opacity-60 transition-opacity" : undefined}>
					{transactions.isLoading && <Skeleton className="h-40 rounded-xl" />}
					{transactions.isError && (
						<div className="space-y-3 text-center text-sm">
							<p>We couldn&apos;t load your activity.</p>
							<Button variant="outline" onClick={() => transactions.refetch()}>
								Try again
							</Button>
						</div>
					)}
					{!transactions.isLoading && !transactions.isError && items.length === 0 && (
						<div className="flex flex-col items-center gap-2 py-8 text-center">
							<WalletIcon className="size-8 text-muted-foreground" />
							<p className="text-sm font-medium">No activity yet</p>
							<p className="max-w-xs text-[12px] text-muted-foreground">Transfers you make and plans you pay for will show up here.</p>
						</div>
					)}
					{items.length > 0 && <WalletTransactionList items={items} />}
					{meta && meta.totalPages > 1 && <SimplePagination className="mt-4 border-t pt-4" page={meta.page} totalPages={meta.totalPages} onChange={setPage} />}
				</SectionCard>
			</div>
		</div>
	);
}

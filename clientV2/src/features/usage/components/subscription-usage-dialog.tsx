"use client";

import { useState } from "react";
import { InfoTile } from "@/components/shared/info-tile";
import { SimplePagination } from "@/components/shared/simple-pagination";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import type { Subscription } from "@/features/subscriptions/types/subscriptions.types";
import { formatBytes, formatDateTime, formatRemaining, humanize } from "@/lib/format";
import { useSubscriptionUsageRecords, useSubscriptionUsageStats } from "../hooks/use-usage";
import type { UsageStats } from "../types/usage.types";

function StatsTiles({ stats }: { stats: UsageStats }) {
	const cap = stats.dataCapBytes ?? 0;
	const duration = stats.durationSeconds ?? 0;
	const dataPercent = cap > 0 ? Math.min(100, (stats.totalBytesUsed / cap) * 100) : 0;
	const timePercent = duration > 0 ? Math.min(100, (stats.totalSecondsUsed / duration) * 100) : 0;

	return (
		<div className="grid gap-3 sm:grid-cols-3">
			<InfoTile label="Data used" value={formatBytes(stats.totalBytesUsed)} hint={cap > 0 ? `of ${formatBytes(cap)}` : "Unlimited plan"}>
				{cap > 0 && <Progress value={dataPercent} className="mt-2 h-1.5" />}
			</InfoTile>
			<InfoTile label="Time used" value={formatRemaining(stats.totalSecondsUsed)} hint={duration > 0 ? `of ${formatRemaining(duration)}` : undefined}>
				{duration > 0 && <Progress value={timePercent} className="mt-2 h-1.5" />}
			</InfoTile>
			<InfoTile label="Last synced" value={stats.lastSyncedAt ? formatDateTime(stats.lastSyncedAt) : "Never"} mono={false} />
		</div>
	);
}

export function SubscriptionUsageDialog({ subscription, onClose }: { subscription: Subscription; onClose: () => void }) {
	const [page, setPage] = useState(1);
	const stats = useSubscriptionUsageStats(subscription.id);
	const records = useSubscriptionUsageRecords(subscription.id, page);

	return (
		<Dialog open onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-2xl">
				<DialogHeader>
					<DialogTitle>Usage</DialogTitle>
					<DialogDescription>{subscription.planSnapshot.name}</DialogDescription>
				</DialogHeader>

				{stats.isLoading && <Skeleton className="h-24 rounded-lg" />}
				{stats.isError && <p className="text-sm text-destructive">We couldn&apos;t load usage totals.</p>}
				{stats.data && <StatsTiles stats={stats.data} />}

				<div className="space-y-2">
					<p className="text-sm font-medium">Recent records</p>
					{records.isLoading && <Skeleton className="h-40 rounded-lg" />}
					{records.isError && <p className="text-sm text-destructive">We couldn&apos;t load usage records.</p>}
					{records.data && records.data.items.length === 0 && (
						<p className="text-[13px] text-muted-foreground">No usage has been recorded yet.</p>
					)}
					{records.data && records.data.items.length > 0 && (
						<>
							<ul className="divide-y rounded-lg border">
								{records.data.items.map((record) => (
									<li key={record.id ?? `${record.recordedAt}-${record.macAddress}`} className="flex items-center justify-between gap-3 p-3">
										<div className="min-w-0">
											<p className="text-[13px]">{formatDateTime(record.recordedAt)}</p>
											<p className="text-mono truncate text-[11px] text-muted-foreground">
												{record.macAddress ?? "No device"}
												{record.source ? ` · ${humanize(record.source)}` : ""}
											</p>
										</div>
										<p className="text-mono shrink-0 text-right text-[12px]">
											{formatBytes(record.bytesUsed)}
											<span className="block text-[11px] text-muted-foreground">{formatRemaining(record.secondsUsed)}</span>
										</p>
									</li>
								))}
							</ul>
							<SimplePagination page={page} totalPages={records.data.meta?.totalPages ?? 1} onChange={setPage} />
						</>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
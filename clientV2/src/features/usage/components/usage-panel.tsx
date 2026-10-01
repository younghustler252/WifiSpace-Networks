"use client";

import { InfoTile } from "@/components/shared/info-tile";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { formatBytes, formatDateTime, formatRemaining } from "@/lib/format";
import { useUsage } from "../hooks/use-usage";

export function UsagePanel({ accountId }: { accountId: string }) {
	const { data, isLoading, isError } = useUsage(accountId);

	if (isLoading) return <Skeleton className="h-20 rounded-lg" />;
	if (isError || !data) return <p className="text-[12px] text-muted-foreground">Usage isn&apos;t available right now.</p>;

	const totalSeconds = data.totalSecondsUsed + (data.remainingSeconds ?? 0);
	const timePercent = data.remainingSeconds === null || totalSeconds === 0 ? null : (data.totalSecondsUsed / totalSeconds) * 100;
	const unlimitedData = data.remainingBytes === null;

	return (
		<div className="space-y-2">
			<div className="grid grid-cols-2 gap-3">
				<InfoTile
					label="Time used"
					value={formatRemaining(data.totalSecondsUsed)}
					hint={data.remainingSeconds !== null ? `${formatRemaining(data.remainingSeconds)} left` : undefined}
				>
					{timePercent !== null && <Progress value={timePercent} className="mt-2 h-1.5" />}
				</InfoTile>
				<InfoTile
					label="Data used"
					value={formatBytes(data.totalBytesUsed)}
					hint={data.remainingBytes === null ? "Unlimited plan" : `${formatBytes(data.remainingBytes)} left`}
				>
					{!unlimitedData && <Progress value={data.dataUsagePercent} className="mt-2 h-1.5" />}
				</InfoTile>
			</div>
			{data.lastSyncedAt && <p className="text-[11px] text-muted-foreground">Updated {formatDateTime(data.lastSyncedAt)}</p>}
		</div>
	);
}
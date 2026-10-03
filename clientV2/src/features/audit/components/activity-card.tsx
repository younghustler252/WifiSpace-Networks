"use client";

import { SectionCard } from "@/components/shared/section-card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime, formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useMyAudit } from "../hooks/use-audit";
import { actionLabel, getActionTone } from "../lib/audit-format";

const DOT = {
	success: "bg-success",
	warning: "bg-warning",
	danger: "bg-destructive",
	info: "bg-signal",
	neutral: "bg-muted-foreground",
} as const;

export function ActivityCard() {
	const { data, isLoading, isError } = useMyAudit(8);

	function renderBody() {
		if (isLoading) return <Skeleton className="h-40 rounded-lg" />;
		if (isError || !data) return <p className="text-[13px] text-muted-foreground">Activity isn&apos;t available right now.</p>;
		if (data.length === 0) return <p className="text-[13px] text-muted-foreground">No activity yet.</p>;

		return (
			<ul className="space-y-3">
				{data.map((entry) => (
					<li key={entry.id} className="flex items-start gap-3">
						<span className={cn("mt-1.5 size-2 shrink-0 rounded-full", DOT[getActionTone(entry.action)])} />
						<div className="min-w-0">
							<p className="text-[13px]">{actionLabel(entry.action)}</p>
							<p className="text-[11px] text-muted-foreground" title={formatDateTime(entry.createdAt)}>
								{formatRelative(entry.createdAt)}
								{entry.ip ? ` · ${entry.ip}` : ""}
							</p>
						</div>
					</li>
				))}
			</ul>
		);
	}

	return (
		<SectionCard title="Recent activity" description="Sign-ins and changes on your account.">
			<div className="space-y-4">
				{renderBody()}
				<p className="text-[11px] text-muted-foreground">Don&apos;t recognise something? Change your password and contact support.</p>
			</div>
		</SectionCard>
	);
}
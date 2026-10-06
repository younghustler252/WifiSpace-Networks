"use client";

import { useState } from "react";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRelative } from "@/lib/format";
import { useAuditFeed } from "../hooks/use-audit";
import { actionLabel, getActionTone } from "../lib/audit-format";
import type { AuditLogEntry } from "../types/audit.types";
import { ActorCell, AuditEntryDialog } from "./audit-entry-dialog";

interface EntityActivityCardProps {
	entity?: string;
	entityId?: string;
	actorId?: string;
	title?: string;
	description?: string;
}

export function EntityActivityCard({
	entity,
	entityId,
	actorId,
	title = "Activity",
	description = "Who changed what. Tap an entry for the exact changes.",
}: EntityActivityCardProps) {
	const [selected, setSelected] = useState<AuditLogEntry | null>(null);
	const { data, isLoading, isError } = useAuditFeed({ entity, entityId, actorId });
	const byActor = !!actorId && !entityId;

	function renderBody() {
		if (isLoading) return <Skeleton className="h-32 rounded-lg" />;
		if (isError || !data) return <p className="text-[13px] text-muted-foreground">Activity isn&apos;t available right now.</p>;
		if (data.length === 0) return <p className="text-[13px] text-muted-foreground">Nothing has been logged yet.</p>;

		return (
			<ul className="divide-y">
				{data.map((entry) => (
					<li key={entry.id}>
						<button type="button" onClick={() => setSelected(entry)} className="flex w-full items-center justify-between gap-3 py-3 text-left first:pt-0 last:pb-0">
							<div className="min-w-0 space-y-1">
								<StatusBadge status={entry.action} label={actionLabel(entry.action)} tone={getActionTone(entry.action)} />
								{byActor ? <p className="text-[12px] text-muted-foreground">{entry.entity}</p> : <ActorCell entry={entry} />}
							</div>
							<span className="whitespace-nowrap text-[11px] text-muted-foreground">{formatRelative(entry.createdAt)}</span>
						</button>
					</li>
				))}
			</ul>
		);
	}

	return (
		<SectionCard title={title} description={description}>
			{renderBody()}
			{selected && <AuditEntryDialog entry={selected} onClose={() => setSelected(null)} />}
		</SectionCard>
	);
}
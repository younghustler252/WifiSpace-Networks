"use client";

import { DetailList } from "@/components/shared/detail-list";
import { StatusBadge } from "@/components/shared/status-badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { UserNameCell } from "@/features/users/components/user-name-cell";
import { formatDateTime, humanize } from "@/lib/format";
import { actionLabel, changedKeys, formatValue, getActionTone } from "../lib/audit-format";
import type { AuditLogEntry } from "../types/audit.types";

export function ActorCell({ entry }: { entry: AuditLogEntry }) {
	if (entry.actorType === "user" && entry.actorId) return <UserNameCell userId={entry.actorId} />;

	return <span className="text-[13px] text-muted-foreground">{entry.actorType ? humanize(entry.actorType) : "Unknown"}</span>;
}

export function AuditEntryDialog({ entry, onClose }: { entry: AuditLogEntry; onClose: () => void }) {
	const keys = changedKeys(entry.oldValue, entry.newValue);
	const metadata = entry.metadata && Object.keys(entry.metadata).length > 0 ? entry.metadata : null;

	const rows = [
		{ label: "Action", value: <StatusBadge status={entry.action} label={actionLabel(entry.action)} tone={getActionTone(entry.action)} /> },
		{ label: "Actor", value: <ActorCell entry={entry} /> },
		{
			label: "Entity",
			value: (
				<span>
					{entry.entity}
					{entry.entityId && <span className="text-mono block text-[11px] text-muted-foreground">{entry.entityId}</span>}
				</span>
			),
		},
		{ label: "When", value: formatDateTime(entry.createdAt) },
		...(entry.ip ? [{ label: "IP address", value: <span className="text-mono">{entry.ip}</span> }] : []),
		...(entry.userAgent ? [{ label: "Device", value: entry.userAgent }] : []),
	];

	return (
		<Dialog open onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="max-h-[90svh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Audit entry</DialogTitle>
					<DialogDescription>What happened and what changed.</DialogDescription>
				</DialogHeader>

				<DetailList rows={rows} />

				<div className="space-y-2">
					<p className="text-sm font-medium">Changes</p>
					{keys.length === 0 ? (
						<p className="text-[13px] text-muted-foreground">No field changes were recorded.</p>
					) : (
						<ul className="divide-y rounded-lg border text-[12px]">
							{keys.map((key) => (
								<li key={key} className="grid grid-cols-[6.5rem_1fr] gap-3 p-2.5">
									<span className="text-mono text-muted-foreground">{key}</span>
									<span className="text-mono break-words">
										<span className="text-muted-foreground line-through">{formatValue(entry.oldValue?.[key])}</span>
										{" → "}
										{formatValue(entry.newValue?.[key])}
									</span>
								</li>
							))}
						</ul>
					)}
				</div>

				{metadata && (
					<div className="space-y-2">
						<p className="text-sm font-medium">Metadata</p>
						<pre className="text-mono overflow-x-auto rounded-lg border bg-surface-2 p-3 text-[11px]">{JSON.stringify(metadata, null, 2)}</pre>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}

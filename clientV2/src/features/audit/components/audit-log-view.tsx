"use client";

import { useState } from "react";
import { ScrollText, WifiOff } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { SimplePagination } from "@/components/shared/simple-pagination";
import { StatusBadge } from "@/components/shared/status-badge";
import { StatusMessage } from "@/components/shared/status-message";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateTime, formatRelative } from "@/lib/format";
import { useAdminAudit } from "../hooks/use-audit";
import { actionLabel, getActionTone } from "../lib/audit-format";
import type { AuditLogEntry } from "../types/audit.types";
import { ActorCell, AuditEntryDialog } from "./audit-entry-dialog";

const shortId = (id: string | null) => (id ? `…${id.slice(-6)}` : "");

export function AuditLogView() {
	const [page, setPage] = useState(1);
	const [selected, setSelected] = useState<AuditLogEntry | null>(null);
	const { data, isLoading, isError, isPlaceholderData, refetch } = useAdminAudit(page);

	function renderBody() {
		if (isLoading) return <Skeleton className="h-96 rounded-xl" />;

		if (isError || !data) {
			return (
				<StatusMessage icon={WifiOff} tone="warning" title="We couldn't load the audit log" text="Check your connection and try again.">
					<Button size="lg" className="w-full" onClick={() => refetch()}>
						Try again
					</Button>
				</StatusMessage>
			);
		}

		if (data.items.length === 0) {
			return <StatusMessage icon={ScrollText} title="Nothing logged yet" text="Admin and system actions will appear here." />;
		}

		return (
			<div className={isPlaceholderData ? "opacity-60 transition-opacity" : undefined}>
				<SectionCard
					title="Activity"
					description={data.meta ? `${data.meta.total} entr${data.meta.total === 1 ? "y" : "ies"}` : undefined}
				>
					<div className="hidden md:block">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>When</TableHead>
									<TableHead>Actor</TableHead>
									<TableHead>Action</TableHead>
									<TableHead>Entity</TableHead>
									<TableHead>IP</TableHead>
									<TableHead className="w-20" />
								</TableRow>
							</TableHeader>
							<TableBody>
								{data.items.map((entry) => (
									<TableRow key={entry.id} className="cursor-pointer" onClick={() => setSelected(entry)}>
										<TableCell className="whitespace-nowrap text-[13px] text-muted-foreground" title={formatDateTime(entry.createdAt)}>
											{formatRelative(entry.createdAt)}
										</TableCell>
										<TableCell className="max-w-56">
											<ActorCell entry={entry} />
										</TableCell>
										<TableCell>
											<StatusBadge status={entry.action} label={actionLabel(entry.action)} tone={getActionTone(entry.action)} />
										</TableCell>
										<TableCell className="text-[13px]">
											{entry.entity}
											<span className="text-mono ml-1.5 text-[11px] text-muted-foreground">{shortId(entry.entityId)}</span>
										</TableCell>
										<TableCell className="text-mono text-[12px] text-muted-foreground">{entry.ip ?? "—"}</TableCell>
										<TableCell className="text-right">
											<Button
												variant="ghost"
												size="sm"
												onClick={(event) => {
													event.stopPropagation();
													setSelected(entry);
												}}
											>
												Details
											</Button>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>

					<ul className="divide-y md:hidden">
						{data.items.map((entry) => (
							<li key={entry.id}>
								<button type="button" onClick={() => setSelected(entry)} className="w-full space-y-1.5 py-3 text-left first:pt-0 last:pb-0">
									<div className="flex items-start justify-between gap-3">
										<StatusBadge status={entry.action} label={actionLabel(entry.action)} tone={getActionTone(entry.action)} />
										<span className="whitespace-nowrap text-[11px] text-muted-foreground">{formatRelative(entry.createdAt)}</span>
									</div>
									<ActorCell entry={entry} />
									<p className="text-[12px] text-muted-foreground">
										{entry.entity} <span className="text-mono">{shortId(entry.entityId)}</span>
									</p>
								</button>
							</li>
						))}
					</ul>
				</SectionCard>
				<SimplePagination page={page} totalPages={data.meta?.totalPages ?? 1} onChange={setPage} className="mt-4" />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<PageHeader title="Audit log" description="Who changed what, and when. Select an entry to see the exact changes." />
			{renderBody()}
			{selected && <AuditEntryDialog entry={selected} onClose={() => setSelected(null)} />}
		</div>
	);
}
"use client";

import { useState } from "react";
import { Megaphone, Plus, WifiOff } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { SimplePagination } from "@/components/shared/simple-pagination";
import { StatusBadge } from "@/components/shared/status-badge";
import { StatusMessage } from "@/components/shared/status-message";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateTime, humanize } from "@/lib/format";
import { useAdminNotifications } from "../hooks/use-notifications";
import { getChannelLabel } from "../lib/notification-meta";
import type { AdminNotification } from "../types/notifications.types";
import { ComposeNotificationDialog } from "./compose-notification-dialog";

const date = (n: AdminNotification) => (n.createdAt ? formatDateTime(n.createdAt) : "—");
const meta = (n: AdminNotification) =>
	[getChannelLabel(n.channel), n.priority && humanize(n.priority.toLowerCase())].filter(Boolean).join(" · ");

export function NotificationsAdmin() {
	const [page, setPage] = useState(1);
	const [composing, setComposing] = useState(false);
	const { data, isLoading, isError, isPlaceholderData, refetch } = useAdminNotifications(page);

	function renderBody() {
		if (isLoading) return <Skeleton className="h-96 rounded-xl" />;

		if (isError || !data) {
			return (
				<StatusMessage icon={WifiOff} tone="warning" title="We couldn't load notifications" text="Check your connection and try again.">
					<Button size="lg" className="w-full" onClick={() => refetch()}>
						Try again
					</Button>
				</StatusMessage>
			);
		}

		if (data.items.length === 0) {
			return (
				<StatusMessage icon={Megaphone} title="Nothing sent yet" text="Send an announcement to keep customers in the loop.">
					<Button size="lg" className="w-full" onClick={() => setComposing(true)}>
						New notification
					</Button>
				</StatusMessage>
			);
		}

		return (
			<div className={isPlaceholderData ? "opacity-60 transition-opacity" : undefined}>
				<SectionCard
					title="Sent notifications"
					description={data.meta ? `${data.meta.total} notification${data.meta.total === 1 ? "" : "s"}` : undefined}
				>
					<div className="hidden md:block">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Sent</TableHead>
									<TableHead>Notification</TableHead>
									<TableHead>Delivery</TableHead>
									<TableHead className="text-right">Recipients</TableHead>
									<TableHead className="text-right">State</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{data.items.map((n) => (
									<TableRow key={n.id}>
										<TableCell className="whitespace-nowrap text-[13px] text-muted-foreground">{date(n)}</TableCell>
										<TableCell className="max-w-md">
											<p className="truncate text-[13px] font-medium">{n.title}</p>
											<p className="line-clamp-1 text-[12px] text-muted-foreground">{n.message}</p>
										</TableCell>
										<TableCell className="text-[13px] text-muted-foreground">{meta(n) || "—"}</TableCell>
										<TableCell className="text-mono text-right text-[13px]">{n.recipientCount ?? "—"}</TableCell>
										<TableCell className="text-right">{n.state ? <StatusBadge status={n.state} /> : "—"}</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>

					<ul className="divide-y md:hidden">
						{data.items.map((n) => (
							<li key={n.id} className="space-y-1.5 py-3 first:pt-0 last:pb-0">
								<div className="flex items-start justify-between gap-3">
									<p className="text-[13px] font-medium">{n.title}</p>
									{n.state && <StatusBadge status={n.state} />}
								</div>
								<p className="line-clamp-2 text-[12px] text-muted-foreground">{n.message}</p>
								<p className="text-[11px] text-muted-foreground">
									{date(n)}
									{meta(n) ? ` · ${meta(n)}` : ""}
									{n.recipientCount !== undefined ? ` · ${n.recipientCount} recipients` : ""}
								</p>
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
			<PageHeader
				title="Broadcasts"
				description="Announcements and alerts to your customers and team."
				actions={
					<Button onClick={() => setComposing(true)}>
						<Plus />
						New notification
					</Button>
				}
			/>
			{renderBody()}
			{composing && <ComposeNotificationDialog onClose={() => setComposing(false)} />}
		</div>
	);
}
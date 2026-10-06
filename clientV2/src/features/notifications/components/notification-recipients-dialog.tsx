"use client";

import { useState } from "react";
import { SimplePagination } from "@/components/shared/simple-pagination";
import { StatusBadge } from "@/components/shared/status-badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useNotificationRecipients } from "../hooks/use-notifications";
import { getChannelLabel } from "../lib/notification-meta";
import type { AdminNotification } from "../types/notifications.types";

export function NotificationRecipientsDialog({ notification, onClose }: { notification: AdminNotification; onClose: () => void }) {
	const [page, setPage] = useState(1);
	const { data, isLoading, isError } = useNotificationRecipients(notification.id, page);

	return (
		<Dialog open onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-2xl">
				<DialogHeader>
					<DialogTitle>Delivery</DialogTitle>
					<DialogDescription>{notification.title}</DialogDescription>
				</DialogHeader>

				{isLoading && <Skeleton className="h-64 rounded-lg" />}
				{isError && <p className="text-sm text-destructive">We couldn&apos;t load the recipients.</p>}
				{data && data.items.length === 0 && <p className="text-[13px] text-muted-foreground">No recipients were recorded for this notification.</p>}

				{data && data.items.length > 0 && (
					<>
						<p className="text-[12px] text-muted-foreground">{data.meta ? `${data.meta.total} recipient${data.meta.total === 1 ? "" : "s"}` : ""}</p>
						<ul className="divide-y rounded-lg border">
							{data.items.map((row) => (
								<li key={row.id} className="space-y-1 p-3" title={row.providerMessageId ?? undefined}>
									<div className="flex items-center justify-between gap-3">
										<div className="min-w-0">
											<p className="truncate text-[13px] font-medium">{row.name}</p>
											{row.email && row.email !== row.name && <p className="truncate text-[11px] text-muted-foreground">{row.email}</p>}
										</div>
										<div className="flex shrink-0 items-center gap-2">
											{row.channel && <span className="text-[11px] text-muted-foreground">{getChannelLabel(row.channel)}</span>}
											<StatusBadge status={row.status} />
										</div>
									</div>
									{row.failedReason && <p className="text-[12px] text-destructive">{row.failedReason}</p>}
								</li>
							))}
						</ul>
						<SimplePagination page={page} totalPages={data.meta?.totalPages ?? 1} onChange={setPage} />
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}
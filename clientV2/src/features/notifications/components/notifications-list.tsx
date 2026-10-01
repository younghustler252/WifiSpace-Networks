"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, WifiOff } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { SimplePagination } from "@/components/shared/simple-pagination";
import { StatusMessage } from "@/components/shared/status-message";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMarkNotificationRead, useNotifications } from "../hooks/use-notifications";
import { getNotificationMeta } from "../lib/notification-meta";
import type { NotificationItem } from "../types/notifications.types";
import { NotificationRow } from "./notification-row";

export function NotificationsList() {
	const router = useRouter();
	const [page, setPage] = useState(1);
	const { data, isLoading, isError, isPlaceholderData, refetch } = useNotifications(page);
	const markRead = useMarkNotificationRead();

	function open(item: NotificationItem) {
		if (!item.isRead) markRead.mutate(item.id);
		const href = getNotificationMeta(item.type).href(item.accountId);
		if (href) router.push(href);
	}

	function renderBody() {
		if (isLoading) return <Skeleton className="h-72 rounded-xl" />;

		if (isError || !data) {
			return (
				<StatusMessage icon={WifiOff} tone="warning" title="We couldn't load your notifications" text="Check your connection and try again.">
					<Button size="lg" className="w-full" onClick={() => refetch()}>
						Try again
					</Button>
				</StatusMessage>
			);
		}

		if (data.items.length === 0 && page === 1) {
			return (
				<StatusMessage
					icon={Bell}
					title="You're all caught up"
					text="We'll let you know here about payments, plan expiry and account updates."
				/>
			);
		}

		return (
			<div className={isPlaceholderData ? "opacity-60 transition-opacity" : undefined}>
				<SectionCard
					title="Inbox"
					description={data.meta ? `${data.meta.total} notification${data.meta.total === 1 ? "" : "s"}` : undefined}
					className="overflow-hidden"
				>
					<ul className="-m-4 divide-y">
						{data.items.map((item) => (
							<NotificationRow key={item.id} item={item} onOpen={open} />
						))}
					</ul>
				</SectionCard>
				<SimplePagination page={page} totalPages={data.meta?.totalPages ?? 1} onChange={setPage} className="mt-4" />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<PageHeader title="Notifications" description="Payments, plan reminders and account updates." />
			{renderBody()}
		</div>
	);
}
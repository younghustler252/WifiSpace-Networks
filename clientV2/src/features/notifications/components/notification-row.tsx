import { formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import { TONE_CLASSES, getNotificationMeta } from "../lib/notification-meta";
import type { NotificationItem } from "../types/notifications.types";

interface NotificationRowProps {
	item: NotificationItem;
	onOpen: (item: NotificationItem) => void;
}

export function NotificationRow({ item, onOpen }: NotificationRowProps) {
	const meta = getNotificationMeta(item.type);
	const Icon = meta.icon;

	return (
		<li>
			<button
				type="button"
				onClick={() => onOpen(item)}
				className={cn(
					"flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50",
					"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
					!item.isRead && "bg-accent/30"
				)}
			>
				<span className={cn("mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg", TONE_CLASSES[meta.tone])}>
					<Icon className="size-4" />
				</span>
				<span className="min-w-0 flex-1">
					<span className="flex items-start justify-between gap-3">
						<span className={cn("text-[13px]", item.isRead ? "font-medium" : "font-semibold")}>{item.title}</span>
						<span className="flex shrink-0 items-center gap-2 whitespace-nowrap text-[11px] text-muted-foreground">
							{formatRelative(item.createdAt)}
							{!item.isRead && <span className="size-2 rounded-full bg-signal" aria-label="Unread" />}
						</span>
					</span>
					{item.message && <span className="mt-0.5 line-clamp-2 block text-[12px] text-muted-foreground">{item.message}</span>}
				</span>
			</button>
		</li>
	);
}
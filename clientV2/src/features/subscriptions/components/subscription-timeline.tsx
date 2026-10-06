import { SectionCard } from "@/components/shared/section-card";
import { formatDateTime, formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import { EVENT_TONE, describeEvent, eventMeta } from "../lib/subscription-events";
import type { SubscriptionEvent } from "../types/subscriptions.types";

export function SubscriptionTimeline({ events }: { events: SubscriptionEvent[] }) {
	const sorted = [...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

	return (
		<SectionCard title="Activity" description="Everything that happened to this subscription, newest first.">
			{sorted.length === 0 ? (
				<p className="text-[13px] text-muted-foreground">No events recorded.</p>
			) : (
				<ol className="space-y-4">
					{sorted.map((event, index) => {
						const meta = eventMeta(event.type);
						const detail = describeEvent(event);

						return (
							<li key={`${event.type}-${event.date}-${index}`} className="flex gap-3">
								<span className={cn("flex size-8 shrink-0 items-center justify-center rounded-full", EVENT_TONE[meta.tone])}>
									<meta.icon className="size-4" />
								</span>
								<div className="min-w-0">
									<p className="text-[13px] font-medium">{meta.label}</p>
									{detail && <p className="text-[12px] text-muted-foreground">{detail}</p>}
									<p className="text-[11px] text-muted-foreground" title={formatDateTime(event.date)}>
										{formatRelative(event.date)} · {formatDateTime(event.date)}
									</p>
								</div>
							</li>
						);
					})}
				</ol>
			)}
		</SectionCard>
	);
}
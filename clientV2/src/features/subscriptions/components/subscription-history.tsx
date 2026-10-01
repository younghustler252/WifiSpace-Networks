import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatCurrency, formatDate } from "@/lib/format";
import { getSubscriptionPhase } from "../lib/subscription-phase";
import type { Subscription } from "../types/subscriptions.types";

export function SubscriptionHistory({ subscriptions }: { subscriptions: Subscription[] }) {
	return (
		<SectionCard title="Plan history" description="Every plan on this account, newest first.">
			{subscriptions.length === 0 ? (
				<p className="text-[13px] text-muted-foreground">No plans yet.</p>
			) : (
				<ul className="divide-y">
					{subscriptions.map((s) => {
						const phase = getSubscriptionPhase(s);
						const range = [s.startsAt && formatDate(s.startsAt), s.expiresAt && formatDate(s.expiresAt)].filter(Boolean).join(" – ");

						return (
							<li key={s.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
								<div className="min-w-0">
									<p className="truncate text-[13px] font-medium">
										{s.planSnapshot.name}
										{s.cycles > 1 ? ` × ${s.cycles}` : ""}
									</p>
									{range && <p className="text-[11px] text-muted-foreground">{range}</p>}
								</div>
								<div className="flex flex-col items-end gap-1">
									<span className="text-mono text-[13px]">{formatCurrency(s.totalAmount)}</span>
									<StatusBadge status={phase} label={phase === "none" ? s.status : undefined} />
								</div>
							</li>
						);
					})}
				</ul>
			)}
		</SectionCard>
	);
}
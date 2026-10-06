"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AccountActionsMenu, type AccountAction } from "@/features/accounts/components/account-actions-menu";
import { approvalOf, getAccountTitle } from "@/features/accounts/lib/account-meta";
import type { AdminAccount } from "@/features/accounts/types/accounts.types";
import { getSubscriptionPhase, pickCurrentSubscription } from "@/features/subscriptions/lib/subscription-phase";
import type { Subscription } from "@/features/subscriptions/types/subscriptions.types";
import { formatDate } from "@/lib/format";

function planLine(account: AdminAccount, subscription: Subscription | null) {
	const approval = approvalOf(account);
	if (approval === "pending") return "Awaiting approval";
	if (approval === "rejected") return "Request rejected";
	if (!subscription) return "No plan yet";

	const phase = getSubscriptionPhase(subscription);
	const when = subscription.expiresAt ? formatDate(subscription.expiresAt) : null;
	const name = subscription.planSnapshot.name;

	return phase === "active" ? `${name} · expires ${when}` : `${name} · ${phase}${when ? ` ${when}` : ""}`;
}

interface UserAccountsCardProps {
	accounts: AdminAccount[];
	subscriptions: Subscription[];
	loading: boolean;
	failed: boolean;
	onAdd: () => void;
	onAction: (action: AccountAction, account: AdminAccount) => void;
}

export function UserAccountsCard({ accounts, subscriptions, loading, failed, onAdd, onAction }: UserAccountsCardProps) {
	function renderBody() {
		if (loading) return <Skeleton className="h-28 rounded-lg" />;
		if (failed) return <p className="text-[13px] text-muted-foreground">Accounts aren&apos;t available right now.</p>;

		if (accounts.length === 0) {
			return (
				<div className="space-y-3">
					<p className="text-[13px] text-muted-foreground">This customer has no accounts yet.</p>
					<Button variant="outline" className="bg-surface-2" onClick={onAdd}>
						<Plus />
						Add account
					</Button>
				</div>
			);
		}

		return (
			<ul className="divide-y">
				{accounts.map((account) => {
					const current = pickCurrentSubscription(subscriptions, account.id);
					const approval = approvalOf(account);

					return (
						<li key={account.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
							<div className="min-w-0 flex-1 space-y-1">
								<div className="flex flex-wrap items-center gap-x-2 gap-y-1">
									<Link href={`/admin/accounts/${account.id}`} className="text-mono text-[13px] font-medium hover:text-signal">
										{account.wsnId}
									</Link>
									<span className="text-[12px] text-muted-foreground">{getAccountTitle(account)}</span>
								</div>
								<p className="truncate text-[12px] text-muted-foreground">{planLine(account, current)}</p>
							</div>
							<StatusBadge status={approval === "approved" ? account.status : approval} />
							<AccountActionsMenu account={account} onAction={(action) => onAction(action, account)} />
						</li>
					);
				})}
			</ul>
		);
	}

	return (
		<SectionCard
			title="Accounts"
			description="Every line and hotspot identity this customer holds."
			actions={
				accounts.length > 0 ? (
					<Button variant="outline" size="sm" className="bg-surface-2" onClick={onAdd}>
						<Plus />
						Add
					</Button>
				) : undefined
			}
		>
			{renderBody()}
		</SectionCard>
	);
}
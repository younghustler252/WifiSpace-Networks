"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, SearchX, WifiOff } from "lucide-react";
import { InfoTile } from "@/components/shared/info-tile";
import { Notice } from "@/components/shared/notice";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { StatusMessage } from "@/components/shared/status-message";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EntityActivityCard } from "@/features/audit/components/entity-activity-card";
import { LinkedPaymentsCard } from "@/features/payments/components/linked-payments-card";
import { SubscriptionUsageCard } from "@/features/subscriptions/components/subscription-usage-card";
import { useAccountSubscriptions } from "@/features/subscriptions/hooks/use-subscriptions";
import { getDisplayStatus, getSubscriptionPhase, pickCurrentSubscription } from "@/features/subscriptions/lib/subscription-phase";
// import { AccountTicketsCard } from "@/features/tickets/components/account-tickets-card";
import { useCountdown } from "@/hooks/use-countdown";
import { ApiError } from "@/lib/api/unwrap";
import { formatDate, formatDateTime, formatRemaining } from "@/lib/format";
import { useAdminAccount } from "../hooks/use-accounts";
import { approvalOf, getAccountTitle } from "../lib/account-meta";
import type { AdminAccount } from "../types/accounts.types";
import { AccountActionsMenu, type AccountAction } from "./account-actions-menu";
import { AccountActionDialog } from "./account-dialogs";
import { AccountDetailsCard, InstallCard, OwnerCard } from "./account-side-cards";
import { AccountSubscriptionsCard } from "./account-subscriptions-card";
import { HotspotDevicesCard, HotspotLocationsCard } from "./hotspot-connections";

interface ServiceCardProps {
	account: AdminAccount;
	onAction: (action: AccountAction) => void;
}

function ServiceCard({ account, onAction }: ServiceCardProps) {
	const subs = useAccountSubscriptions(account.id);
	const current = pickCurrentSubscription(subs.data?.items, account.id);
	const phase = getSubscriptionPhase(current);
	const secondsLeft = useCountdown(current?.expiresAt);

	const approval = approvalOf(account);
	const approved = approval === "approved";
	const onHold = account.status === "paused" || account.status === "suspended";
	const terminated = account.status === "terminated";
	const canCreate = approved && !terminated && (phase === "none" || phase === "expired" || phase === "canceled");

	const tiles: { label: string; value: React.ReactNode; mono?: boolean }[] = [];
	if (current) {
		tiles.push({
			label: "Plan",
			mono: false,
			value: (
				<Link href={`/admin/subscriptions/${current.id}`} className="hover:text-signal">
					{current.planSnapshot.name}
				</Link>
			),
		});
		tiles.push({ label: "Subscription", mono: false, value: <StatusBadge status={getDisplayStatus(current)} /> });
		if (current.expiresAt) {
			if (phase === "active") {
				tiles.push({ label: "Time left", value: formatRemaining(secondsLeft) });
				tiles.push({ label: "Expires", value: formatDateTime(current.expiresAt) });
			} else {
				tiles.push({ label: "Expired", value: formatDate(current.expiresAt) });
			}
		}
	}

	return (
		<SectionCard title="Service" description="Where this account stands right now.">
			<div className="space-y-4">
				{approval === "pending" && (
					<Notice tone="warning" title="Waiting for approval" text="Review the request, then approve it with a router or reject it with a reason." />
				)}
				{approval === "rejected" && <Notice tone="danger" title="Request rejected" text={account.approvalNote ?? "No reason was recorded."} />}
				{approved && onHold && <Notice tone="warning" title={`Account is ${account.status}`} text="The customer has no service until it's resumed." />}
				{terminated && <Notice tone="danger" title="Account terminated" text="Service has ended for this account." />}

				{approval === "pending" && (
					<div className="flex flex-wrap gap-3">
						<Button onClick={() => onAction("approve")}>Approve…</Button>
						<Button variant="outline" className="bg-surface-2" onClick={() => onAction("reject")}>
							Reject…
						</Button>
					</div>
				)}

				{approved && subs.isLoading && <Skeleton className="h-20 rounded-lg" />}

				{approved && !subs.isLoading && (
					<>
						{tiles.length > 0 ? (
							<div className="grid grid-cols-2 gap-3 md:grid-cols-4">
								{tiles.map((tile) => (
									<InfoTile key={tile.label} label={tile.label} value={tile.value} mono={tile.mono} />
								))}
							</div>
						) : (
							<p className="text-[13px] text-muted-foreground">This account has no plan yet.</p>
						)}

						{!terminated && (
							<div className="flex flex-wrap gap-3">
								{canCreate && <Button onClick={() => onAction("subscribe")}>Create subscription</Button>}
								{current && !canCreate && (
									<Button asChild variant="outline" className="bg-surface-2">
										<Link href={`/admin/subscriptions/${current.id}`}>Manage subscription</Link>
									</Button>
								)}
								<Button variant="outline" className="bg-surface-2" onClick={() => onAction("record-payment")}>
									Record payment
								</Button>
							</div>
						)}
					</>
				)}
			</div>
		</SectionCard>
	);
}

function AccountUsage({ accountId }: { accountId: string }) {
	const subs = useAccountSubscriptions(accountId);
	const current = pickCurrentSubscription(subs.data?.items, accountId);

	if (!current || getSubscriptionPhase(current) === "none") return null;
	return <SubscriptionUsageCard subscription={current} />;
}

export function AdminAccountView({ id }: { id: string }) {
	const { data, isLoading, isError, error, refetch } = useAdminAccount(id);
	const [action, setAction] = useState<AccountAction | null>(null);

	if (isLoading) {
		return (
			<div className="space-y-6">
				<Skeleton className="h-12 w-72 rounded-lg" />
				<div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
					<Skeleton className="h-96 rounded-xl" />
					<Skeleton className="h-72 rounded-xl" />
				</div>
			</div>
		);
	}

	if (isError || !data) {
		if (error instanceof ApiError && error.code.endsWith("NOT_FOUND")) {
			return (
				<StatusMessage icon={SearchX} tone="warning" title="Account not found" text="This account doesn't exist.">
					<Button asChild size="lg" className="w-full">
						<Link href="/admin/accounts">Back to accounts</Link>
					</Button>
				</StatusMessage>
			);
		}

		return (
			<StatusMessage icon={WifiOff} tone="warning" title="We couldn't load this account" text="Check your connection and try again.">
				<Button size="lg" className="w-full" onClick={() => refetch()}>
					Try again
				</Button>
			</StatusMessage>
		);
	}

	const { account, router } = data;
	const isHotspot = account.serviceType === "hotspot";
	const approval = approvalOf(account);

	return (
		<div className="space-y-6">
			<div className="space-y-3">
				<Link href="/admin/accounts" className="inline-flex items-center gap-1 text-[12px] text-muted-foreground hover:text-foreground">
					<ChevronLeft className="size-4" />
					Accounts
				</Link>
				<PageHeader
					title={account.wsnId}
					description={`${getAccountTitle(account)} · Created ${formatDate(account.createdAt)}`}
					actions={
						<div className="flex items-center gap-2">
							<StatusBadge status={account.status} />
							{approval !== "approved" && <StatusBadge status={approval} />}
							<AccountActionsMenu account={account} onAction={setAction} />
						</div>
					}
				/>
			</div>

			<div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
				<div className="space-y-4">
					<ServiceCard account={account} onAction={setAction} />
					<AccountSubscriptionsCard accountId={account.id} />
					<AccountUsage accountId={account.id} />
					<LinkedPaymentsCard params={{ accountId: account.id }} />
					<EntityActivityCard entity="Account" entityId={account.id} />
				</div>

				<div className="space-y-4">
					<OwnerCard account={account} />
					<AccountDetailsCard account={account} />
					{isHotspot ? (
						<>
							<HotspotDevicesCard account={account} />
							<HotspotLocationsCard accountId={account.id} />
						</>
					) : (
						<InstallCard account={account} router={router} />
					)}
					{/* <AccountTicketsCard userId={account.userId} accountId={account.id} /> */}
				</div>
			</div>

			{action && <AccountActionDialog action={action} account={account} onClose={() => setAction(null)} />}
		</div>
	);
}
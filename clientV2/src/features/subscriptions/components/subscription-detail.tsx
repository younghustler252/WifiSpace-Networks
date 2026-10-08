"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, SearchX, WifiOff } from "lucide-react";
import { DetailList } from "@/components/shared/detail-list";
import { InfoTile } from "@/components/shared/info-tile";
import { Notice } from "@/components/shared/notice";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { StatusMessage } from "@/components/shared/status-message";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { approvalOf, formatLocation, getAccountTitle } from "@/features/accounts/lib/account-meta";
import { useAdminUser } from "@/features/users/hooks/use-users";
import { useCountdown } from "@/hooks/use-countdown";
import { ApiError } from "@/lib/api/unwrap";
import { formatCurrency, formatDate, formatDateTime, formatDuration, formatRemaining, humanize } from "@/lib/format";
import { SUBSCRIPTION_ERROR_CODES } from "../constants";
import { useAdminSubscription } from "../hooks/use-subscriptions";
import { endedEarly, effectiveEnd, getDisplayStatus, getSubscriptionPhase, type SubscriptionAction } from "../lib/subscription-phase";
import type { AdminSubscriptionDetail } from "../types/subscriptions.types";
import { ProvisioningCard } from "./provisioning-card";
import { SubscriptionActionsMenu } from "./subscription-actions-menu";
import { SubscriptionActionDialog } from "./subscription-dialogs";
import { SubscriptionPaymentsCard } from "./subscription-payments-card";
import { SubscriptionTimeline } from "./subscription-timeline";
import { SubscriptionUsageCard } from "./subscription-usage-card";

function StatusTiles({ detail }: { detail: AdminSubscriptionDetail }) {
	const { subscription: s } = detail;
	const phase = getSubscriptionPhase(s);
	const secondsLeft = useCountdown(s.expiresAt);
	const tiles: { label: string; value: string; hint?: string }[] = [];

	if (s.expiresAt) {
		if (phase === "active") {
			tiles.push({ label: "Time left", value: formatRemaining(secondsLeft) }, { label: "Expires", value: formatDateTime(s.expiresAt) });
		} else {
			tiles.push({ label: "Expired", value: formatDateTime(effectiveEnd(s) ?? s.expiresAt) });
			if (endedEarly(s)) {
				tiles.push({ label: "Original expiry", value: formatDateTime(s.expiresAt), hint: "Still in the future" });
			}
		}
	}
	if (s.graceEndsAt) tiles.push({ label: "Grace ends", value: formatDateTime(s.graceEndsAt) });
	if (s.startsAt) tiles.push({ label: "Started", value: formatDate(s.startsAt) });
	if (s.suspendedAt) tiles.push({ label: "Suspended", value: formatDate(s.suspendedAt), hint: s.suspensionReason ?? undefined });
	if (s.canceledAt) tiles.push({ label: "Canceled", value: formatDate(s.canceledAt), hint: s.cancellationReason ?? undefined });

	if (tiles.length === 0) return null;

	return (
		<div className="grid grid-cols-2 gap-3 md:grid-cols-3">
			{tiles.map((tile) => (
				<InfoTile key={tile.label} label={tile.label} value={tile.value} hint={tile.hint} />
			))}
		</div>
	);
}

function PlanBillingCard({ detail }: { detail: AdminSubscriptionDetail }) {
	const { subscription: s } = detail;
	const plan = s.planSnapshot;

	const rows = [
		{ label: "Plan", value: plan.name },
		{ label: "Price", value: `${formatCurrency(plan.price)} / ${formatDuration(plan.durationValue, plan.durationUnit)}` },
		{ label: "Durations granted", value: String(s.cycles) },
		{ label: "Total paid (lifetime)", value: <span className="text-mono">{formatCurrency(s.totalAmount)}</span> },
		...(plan.speedRate ? [{ label: "Speed", value: plan.speedRate }] : []),
		...(plan.devicesAllowed ? [{ label: "Devices allowed", value: String(plan.devicesAllowed) }] : []),
		...(plan.gracePeriodDays ? [{ label: "Grace period", value: `${plan.gracePeriodDays} days` }] : []),
		...(s.bonusDays ? [{ label: "Bonus days", value: String(s.bonusDays) }] : []),
		...(s.manualAdjustmentDays
			? [{ label: "Manual adjustment", value: `${s.manualAdjustmentDays > 0 ? "+" : ""}${s.manualAdjustmentDays} days` }]
			: []),
		{ label: "Renewal", value: `${humanize(s.renewalStrategy)}${s.autoRenewEnabled ? " · auto-renew on" : ""}` },
		...(s.lastPaymentDate
			? [{ label: "Last payment", value: `${formatDate(s.lastPaymentDate)}${s.lastPaymentAmount ? ` · ${formatCurrency(s.lastPaymentAmount)}` : ""}` }]
			: []),
		...(s.nextRenewalDate ? [{ label: "Next renewal", value: formatDate(s.nextRenewalDate) }] : []),
	];

	return (
		<SectionCard title="Plan and billing" description="As it was when the customer subscribed.">
			<DetailList rows={rows} />
		</SectionCard>
	);
}

function CustomerCard({ detail }: { detail: AdminSubscriptionDetail }) {
	const { account, subscription } = detail;
	const embedded = account?.user && (account.user.firstName || account.user.email) ? account.user : null;
	const fetched = useAdminUser(subscription.userId ?? account?.userId, !embedded);
	const owner = embedded ?? fetched.data ?? null;

	if (!owner && fetched.isLoading) return <Skeleton className="h-40 rounded-xl" />;
	if (!owner) return null;

	const rows = [
		{ label: "Name", value: `${owner.firstName ?? ""} ${owner.lastName ?? ""}`.trim() || "—" },
		...(owner.email ? [{ label: "Email", value: <a href={`mailto:${owner.email}`} className="hover:text-signal">{owner.email}</a> }] : []),
		...(owner.phone
			? [{ label: "Phone", value: <a href={`tel:${owner.phone.replace(/\s/g, "")}`} className="text-mono hover:text-signal">{owner.phone}</a> }]
			: []),
		...(owner.address ? [{ label: "Address", value: owner.address }] : []),
	];

	return (
		<SectionCard title="Customer">
			<DetailList rows={rows} />
		</SectionCard>
	);
}

function LinkedAccountCard({ detail }: { detail: AdminSubscriptionDetail }) {
	const { account } = detail;
	if (!account) return null;

	const location = formatLocation(account.requestedLocation);
	const rows = [
		{
			label: "Account ID",
			value: (
				<Link href={`/admin/accounts/${account.id}`} className="text-mono hover:text-signal">
					{account.wsnId}
				</Link>
			),
		},
		{ label: "Service", value: getAccountTitle(account) },
		...(account.accessMethod ? [{ label: "Access method", value: account.accessMethod === "ppp" ? "PPP" : "IPoE" }] : []),
		{ label: "Status", value: <StatusBadge status={account.status} /> },
		{ label: "Approval", value: <StatusBadge status={approvalOf(account)} /> },
		...(account.serviceType === "hotspot" && account.maxDevices !== undefined
			? [{ label: "Devices", value: `${account.devices?.length ?? 0} / ${account.maxDevices}` }]
			: []),
		...(location ? [{ label: "Install location", value: location }] : []),
	];

	return (
		<SectionCard title="Account">
			<DetailList rows={rows} />
		</SectionCard>
	);
}

export function SubscriptionDetail({ id }: { id: string }) {
	const { data, isLoading, isError, error, refetch } = useAdminSubscription(id);
	const [action, setAction] = useState<SubscriptionAction | null>(null);

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
		const notFound =
			error instanceof ApiError && (error.code === "NOT_FOUND" || error.code === SUBSCRIPTION_ERROR_CODES.SUBSCRIPTION_NOT_FOUND);

		if (notFound) {
			return (
				<StatusMessage icon={SearchX} tone="warning" title="Subscription not found" text="This subscription doesn't exist.">
					<Button asChild size="lg" className="w-full">
						<Link href="/admin/subscriptions">Back to subscriptions</Link>
					</Button>
				</StatusMessage>
			);
		}

		return (
			<StatusMessage icon={WifiOff} tone="warning" title="We couldn't load this subscription" text="Check your connection and try again.">
				<Button size="lg" className="w-full" onClick={() => refetch()}>
					Try again
				</Button>
			</StatusMessage>
		);
	}

	const { subscription } = data;
	const created = subscription.createdAt ? ` · Created ${formatDate(subscription.createdAt)}` : "";

	return (
		<div className="space-y-6">
			<div className="space-y-3">
				<Link href="/admin/subscriptions" className="inline-flex items-center gap-1 text-[12px] text-muted-foreground hover:text-foreground">
					<ChevronLeft className="size-4" />
					Subscriptions
				</Link>
				<PageHeader
					title={subscription.planSnapshot.name}
					description={`${data.account ? `${data.account.wsnId} · ${getAccountTitle(data.account)}` : "Subscription"}${created}`}
					actions={
						<div className="flex items-center gap-2">
							<StatusBadge status={getDisplayStatus(subscription)} />
							<SubscriptionActionsMenu subscription={subscription} onAction={setAction} />
						</div>
					}
				/>
			</div>

			{endedEarly(subscription) && (
				<Notice
					tone="warning"
					title="Ended before its expiry date"
					text={`This subscription was ended manually, but its expiry date (${formatDate(subscription.expiresAt!)}) is still in the future. Renewing it may add time on top of that date, so check the new expiry straight after.`}
				/>
			)}

			<div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
				<div className="space-y-4">
					<SectionCard title="Status">
						<StatusTiles detail={data} />
					</SectionCard>
					<PlanBillingCard detail={data} />
					<SubscriptionUsageCard subscription={subscription} />
					<SubscriptionPaymentsCard subscriptionId={subscription.id} />
					<SubscriptionTimeline events={subscription.events ?? []} />
				</div>

				<div className="space-y-4">
					<CustomerCard detail={data} />
					<LinkedAccountCard detail={data} />
					<ProvisioningCard detail={data} />
				</div>
			</div>

			{action && <SubscriptionActionDialog action={action} subscription={subscription} onClose={() => setAction(null)} />}
		</div>
	);
}
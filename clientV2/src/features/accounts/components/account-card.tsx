"use client";

import Link from "next/link";
import { Home, Wifi } from "lucide-react";
import { InfoTile } from "@/components/shared/info-tile";
import { Notice } from "@/components/shared/notice";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { getSubscriptionPhase } from "@/features/subscriptions/lib/subscription-phase";
import type { Subscription } from "@/features/subscriptions/types/subscriptions.types";
import { UsagePanel } from "@/features/usage/components/usage-panel";
import { useCountdown } from "@/hooks/use-countdown";
import { formatDate, formatDateTime, formatRemaining } from "@/lib/format";
import { getAccountTitle } from "../lib/account-meta";
import type { Account } from "../types/accounts.types";

interface AccountCardProps {
	account: Account;
	subscription: Subscription | null;
	showDetailsLink?: boolean;
}

export function AccountCard({ account, subscription, showDetailsLink = true }: AccountCardProps) {
	const phase = getSubscriptionPhase(subscription);
	const secondsLeft = useCountdown(subscription?.expiresAt);
	const plan = subscription?.planSnapshot;

	const approved = account.approvalStatus === "approved";
	const pending = account.approvalStatus === "pending";
	const rejected = account.approvalStatus === "rejected";
	const onHold = account.status === "paused" || account.status === "suspended";
	const isHotspot = account.serviceType === "hotspot";
	const Icon = isHotspot ? Wifi : Home;
	const title = getAccountTitle(account);

	const badgeStatus = !approved ? account.approvalStatus : onHold ? account.status : phase !== "none" ? phase : account.status;
	const headline = pending ? "Awaiting approval" : rejected ? "Request not approved" : (plan?.name ?? "No active plan");
	const showUsage = approved && !onHold && (phase === "active" || phase === "grace");

	const tiles: { label: string; value: string }[] = [];
	if (approved && subscription?.expiresAt) {
		if (phase === "active") {
			tiles.push({ label: "Time left", value: formatRemaining(secondsLeft) });
			tiles.push({ label: "Expires", value: formatDate(subscription.expiresAt) });
		} else {
			tiles.push({ label: "Expired", value: formatDate(subscription.expiresAt) });
		}
	}
	if (approved && plan?.speedRate) tiles.push({ label: "Speed", value: plan.speedRate });
	if (approved && isHotspot && account.maxDevices !== undefined) {
		tiles.push({ label: "Devices", value: `${account.devices?.length ?? 0} / ${account.maxDevices}` });
	}

	const cta =
		!approved || onHold || phase === "suspended"
			? null
			: phase === "none" || phase === "canceled"
				? "Choose a plan"
				: phase === "active"
					? "Renew early"
					: "Renew now";

	return (
		<SectionCard title={title} actions={<StatusBadge status={badgeStatus} />}>
			<div className="space-y-4">
				<div className="flex items-center gap-3">
					<Icon className="size-6 shrink-0 text-signal" />
					<div className="min-w-0">
						<div className="truncate font-medium">{headline}</div>
						<div className="text-mono text-[11px] text-muted-foreground">{account.wsnId}</div>
					</div>
				</div>

				{pending && (
					<Notice
						tone="warning"
						title={isHotspot ? "Your request is being reviewed" : "Your installation request is being reviewed"}
						text={
							isHotspot
								? "You can pick a plan as soon as your account is approved."
								: "Our team will review it and get in touch to arrange your installation. You can pick a plan once it's approved."
						}
					/>
				)}
				{rejected && <Notice tone="danger" title="Your request wasn't approved" text="Please contact support if you'd like to know more or try again." />}
				{approved && onHold && (
					<Notice
						tone="warning"
						title="Service is temporarily on hold"
						text="Your service is paused for now and will resume once the hold is lifted. Contact support if you weren't expecting this."
					/>
				)}
				{approved && !onHold && phase === "grace" && subscription?.graceEndsAt && (
					<Notice tone="warning" title="Your plan has expired" text={`You're in a grace period until ${formatDateTime(subscription.graceEndsAt)}. Renew now to stay connected.`} />
				)}
				{approved && !onHold && phase === "expired" && <Notice tone="danger" title="Your plan has expired" text="Renew to get back online." />}
				{approved && !onHold && phase === "canceled" && <Notice tone="danger" title="Your plan was canceled" text="Choose a new plan to get back online." />}
				{approved && !onHold && phase === "suspended" && (
					<Notice tone="warning" title="Your plan is suspended" text="Please contact support to find out why and how to restore it." />
				)}
				{approved && !onHold && phase === "none" && (
					<p className="text-[13px] text-muted-foreground">You don&apos;t have an active plan yet. Choose one to get online.</p>
				)}

				{tiles.length > 0 && (
					<div className="grid grid-cols-2 gap-3">
						{tiles.map((t) => (
							<InfoTile key={t.label} label={t.label} value={t.value} />
						))}
					</div>
				)}

				{showUsage && <UsagePanel accountId={account.id} />}

				<div className="flex flex-wrap items-center gap-x-4 gap-y-2">
					{cta && (
						<Button asChild variant={phase === "active" ? "outline" : "default"} className={phase === "active" ? "bg-surface-2" : undefined}>
							<Link href={`/plans?account=${account.id}`}>{cta}</Link>
						</Button>
					)}
					{showDetailsLink && (
						<Link href={`/accounts/${account.id}`} className="text-[12px] text-signal hover:underline">
							Account details →
						</Link>
					)}
				</div>
			</div>
		</SectionCard>
	);
}

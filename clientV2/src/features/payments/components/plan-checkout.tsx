"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2, WifiOff } from "lucide-react";
import { toast } from "sonner";
import { Notice } from "@/components/shared/notice";
import { PageHeader } from "@/components/shared/page-header";
import { StatusMessage } from "@/components/shared/status-message";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAccounts } from "@/features/accounts/hooks/use-accounts";
import { PlanCard } from "@/features/plans/components/plan-card";
import { usePlans } from "@/features/plans/hooks/use-plans";
import { getBestValueId } from "@/features/plans/lib/best-value";
import { getPlanPricing } from "@/features/plans/lib/pricing";
import type { Plan } from "@/features/plans/types/plans.types";
import { useSubscriptions, useUpgradeOptions } from "@/features/subscriptions/hooks/use-subscriptions";
import { getSubscriptionPhase, pickCurrentSubscription } from "@/features/subscriptions/lib/subscription-phase";
import { formatCurrency } from "@/lib/format";
import { useStartPayment } from "../hooks/use-payments";
import { useIdempotencyKey } from "@/lib/api/idempotency";


interface PlanGroupProps {
	title?: string;
	description?: string;
	plans: Plan[];
	selectedId: string | null;
	bestValueId?: string | null;
	highlightId?: string | null;
	highlightLabel?: string;
	onSelect: (plan: Plan) => void;
}

function PlanGroup({ title, description, plans, selectedId, bestValueId, highlightId, highlightLabel, onSelect }: PlanGroupProps) {
	return (
		<section className="space-y-3">
			{title && (
				<div>
					<h2 className="text-sm font-medium">{title}</h2>
					{description && <p className="text-[12px] text-muted-foreground">{description}</p>}
				</div>
			)}
			<div role="radiogroup" aria-label={title ?? "Plans"} className="grid gap-4 pt-2 sm:grid-cols-2">
				{plans.map((plan) => (
					<PlanCard
						key={plan.id}
						plan={plan}
						selected={plan.id === selectedId}
						highlight={plan.id === highlightId ? highlightLabel : plan.id === bestValueId ? "Best value" : undefined}
						onSelect={onSelect}
					/>
				))}
			</div>
		</section>
	);
}

export function PlanCheckout() {
	const searchParams = useSearchParams();
	const accounts = useAccounts();
	const subscriptions = useSubscriptions();
	const startPayment = useStartPayment();
	const [chosenAccountId, setChosenAccountId] = useState<string | null>(searchParams.get("account"));
	const [planId, setPlanId] = useState<string | null>(null);
	const [redirecting, setRedirecting] = useState(false);

	
	const eligible = useMemo(() => (accounts.data ?? []).filter((a) => a.approvalStatus === "approved"), [accounts.data]);
	const account = eligible.find((a) => a.id === chosenAccountId) ?? eligible[0] ?? null;

	const current = account ? pickCurrentSubscription(subscriptions.data, account.id) : null;
	const isActive = getSubscriptionPhase(current) === "active";

	const plans = usePlans(account?.serviceType);
	const upgrades = useUpgradeOptions(account?.id, isActive);

	const renewPlan = isActive ? (plans.data?.find((p) => p.id === current?.planId) ?? null) : null;
	const upgradeList = isActive ? (upgrades.data ?? []) : [];
	const visiblePlans = isActive ? [...(renewPlan ? [renewPlan] : []), ...upgradeList] : (plans.data ?? []);

	const selected = visiblePlans.find((p) => p.id === planId) ?? null;
	const bestValueId = useMemo(() => (isActive ? null : getBestValueId(plans.data ?? [])), [isActive, plans.data]);
	const loading = plans.isLoading || subscriptions.isLoading || (isActive && upgrades.isLoading);
	const failed = plans.isError || (isActive && upgrades.isError);
	const busy = startPayment.isPending || redirecting;
	const isUpgrade = isActive && !!selected && selected.id !== current?.planId;
	const idempotencyKey = useIdempotencyKey(`${account?.id}|${planId}`);

	async function handlePay() {
		if (!account || !selected || busy) return;

		const res = await startPayment.mutateAsync({
			accountId: account.id,
			planId: selected.id,
			callbackUrl: `${window.location.origin}/payments/callback`,
			idempotencyKey
		});

		if (!res.success) {
			toast.error(res.message);
			return;
		}
		
		setRedirecting(true);
		window.location.assign(res.data.authorizationUrl);
	}

	if (accounts.isLoading) {
		return (
			<div className="space-y-6">
				<Skeleton className="h-14 rounded-xl" />
				<div className="grid gap-3 sm:grid-cols-2">
					{[0, 1, 2, 3].map((i) => (
						<Skeleton key={i} className="h-32 rounded-2xl" />
					))}
				</div>
			</div>
		);
	}

	if (accounts.isError) {
		return (
			<StatusMessage icon={WifiOff} tone="warning" title="We couldn't load your accounts" text="Check your connection and try again.">
				<Button size="lg" className="w-full" onClick={() => accounts.refetch()}>
					Try again
				</Button>
			</StatusMessage>
		);
	}

	if (!account) {
		return (
			<StatusMessage
				icon={WifiOff}
				tone="warning"
				title="No approved account yet"
				text="Once your account request is approved, you'll be able to pick a plan here."
			>
				<Button asChild size="lg" className="w-full">
					<Link href="/overview">Back to overview</Link>
				</Button>
			</StatusMessage>
		);
	}

	function renderPlans() {
		if (loading) {
			return (
				<div className="grid gap-3 sm:grid-cols-2">
					{[0, 1, 2, 3].map((i) => (
						<Skeleton key={i} className="h-32 rounded-2xl" />
					))}
				</div>
			);
		}

		if (failed) {
			return (
				<div className="card-elevated space-y-3 bg-surface-2 p-4 text-center text-sm">
					<p>We couldn&apos;t load the plans.</p>
					<Button
						variant="outline"
						onClick={() => {
							plans.refetch();
							upgrades.refetch();
						}}
					>
						Try again
					</Button>
				</div>
			);
		}

		if (!isActive) {
			if (visiblePlans.length === 0) {
				return <p className="card-elevated bg-surface-2 p-4 text-center text-sm text-muted-foreground">No plans are available right now.</p>;
			}
			return <PlanGroup plans={visiblePlans} selectedId={planId} bestValueId={bestValueId} onSelect={(p) => setPlanId(p.id)} />;
		}

		return (
			<div className="space-y-8">
				{renewPlan && (
					<PlanGroup
						title="Renew your current plan"
						description="Adds another period on top of the time you have left."
						plans={[renewPlan]}
						selectedId={planId}
						highlightId={renewPlan.id}
						highlightLabel="Current plan"
						onSelect={(p) => setPlanId(p.id)}
					/>
				)}

				<div className="space-y-3">
					{upgradeList.length > 0 ? (
						<>
							<PlanGroup
								title="Upgrade"
								description="Move to a higher plan."
								plans={upgradeList}
								selectedId={planId}
								onSelect={(p) => setPlanId(p.id)}
							/>
							<Notice
								tone="info"
								title="Your remaining time is kept"
								text="When you upgrade, the time left on your current plan is added on top of the new plan's full duration."
							/>
						</>
					) : (
						<p className="card-elevated bg-surface-2 p-4 text-center text-[13px] text-muted-foreground">
							You&apos;re already on our highest plan.
						</p>
					)}
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<PageHeader
				title={isActive ? "Renew or upgrade" : "Choose a plan"}
				description="Pay securely with Paystack. Your service activates automatically."
			/>

			{eligible.length > 1 && (
				<Select
					value={account.id}
					onValueChange={(value) => {
						setChosenAccountId(value);
						setPlanId(null);
					}}
				>
					<SelectTrigger className="w-full sm:w-80" aria-label="Account">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{eligible.map((a) => (
							<SelectItem key={a.id} value={a.id}>
								{a.wsnId} · {a.serviceType === "hotspot" ? "Hotspot" : "Home internet"}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			)}

			{renderPlans()}

			{!loading && !failed && visiblePlans.length > 0 && (
				<div className="card-elevated sticky bottom-20 flex items-center justify-between gap-4 bg-background/95 p-3 backdrop-blur lg:bottom-4">
					<div className="min-w-0">
						<p className="truncate text-sm font-medium">{selected ? selected.name : "No plan selected"}</p>
						<p className="text-mono text-xs text-muted-foreground">
							{selected ? formatCurrency(getPlanPricing(selected).final) : "Select a plan to continue"}
						</p>
					</div>
					<Button size="lg" disabled={!selected || busy} onClick={handlePay}>
						{busy && <Loader2 className="animate-spin" />}
						{isUpgrade ? "Upgrade and pay" : "Pay securely"}
					</Button>
				</div>
			)}
		</div>
	);
}
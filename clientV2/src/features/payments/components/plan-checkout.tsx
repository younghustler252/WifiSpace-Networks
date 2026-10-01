"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2, WifiOff } from "lucide-react";
import { toast } from "sonner";
import { StatusMessage } from "@/components/shared/status-message";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAccounts } from "@/features/accounts/hooks/use-accounts";
import { PlanCard } from "@/features/plans/components/plan-card";
import { usePlans } from "@/features/plans/hooks/use-plans";
import { getBestValueId } from "@/features/plans/lib/best-value";
import { formatCurrency } from "@/lib/format";
import { useStartPayment } from "../hooks/use-payments";

export function PlanCheckout() {
	const searchParams = useSearchParams();
	const accounts = useAccounts();
	const startPayment = useStartPayment();
	const [chosenAccountId, setChosenAccountId] = useState<string | null>(searchParams.get("account"));
	const [planId, setPlanId] = useState<string | null>(null);
	const [redirecting, setRedirecting] = useState(false);

	const eligible = useMemo(() => (accounts.data ?? []).filter((a) => a.approvalStatus === "approved"), [accounts.data]);
	const account = eligible.find((a) => a.id === chosenAccountId) ?? eligible[0] ?? null;
	const plans = usePlans(account?.serviceType);
	const selected = plans.data?.find((p) => p.id === planId) ?? null;
	const bestValueId = useMemo(() => getBestValueId(plans.data ?? []), [plans.data]);
	const busy = startPayment.isPending || redirecting;

	async function handlePay() {
		if (!account || !selected || busy) return;

		const res = await startPayment.mutateAsync({
			accountId: account.id,
			planId: selected.id,
			callbackUrl: `${window.location.origin}/payments/callback`,
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

	return (
		<div className="space-y-6">
			<PageHeader title="Choose a plan" description="Pay securely with Paystack. Your service activates automatically." />

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

			{plans.isLoading && (
				<div className="grid gap-3 sm:grid-cols-2">
					{[0, 1, 2, 3].map((i) => (
						<Skeleton key={i} className="h-32 rounded-2xl" />
					))}
				</div>
			)}

			{plans.isError && (
				<div className="card-elevated space-y-3 bg-surface-2 p-4 text-center text-sm">
					<p>We couldn&apos;t load the plans.</p>
					<Button variant="outline" onClick={() => plans.refetch()}>
						Try again
					</Button>
				</div>
			)}

			{plans.data && plans.data.length === 0 && (
				<p className="card-elevated bg-surface-2 p-4 text-center text-sm text-muted-foreground">No plans are available right now.</p>
			)}

			{plans.data && plans.data.length > 0 && (
				<div role="radiogroup" aria-label="Plans" className="grid gap-4 pt-2 sm:grid-cols-2">
					{plans.data.map((plan) => (
						<PlanCard
							key={plan.id}
							plan={plan}
							selected={plan.id === planId}
							highlight={plan.id === bestValueId ? "Best value" : undefined}
							onSelect={(p) => setPlanId(p.id)}
						/>
					))}
				</div>
			)}

			{plans.data && plans.data.length > 0 && (
				<div className="card-elevated sticky bottom-20 flex items-center justify-between gap-4 bg-background/95 p-3 backdrop-blur lg:bottom-4">
					<div className="min-w-0">
						<p className="truncate text-sm font-medium">{selected ? selected.name : "No plan selected"}</p>
						<p className="text-mono text-xs text-muted-foreground">{selected ? formatCurrency(selected.price) : "Select a plan to continue"}</p>
					</div>
					<Button size="lg" disabled={!selected || busy} onClick={handlePay}>
						{busy && <Loader2 className="animate-spin" />}
						Pay securely
					</Button>
				</div>
			)}
		</div>
	);
}
"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Field } from "@/components/shared/field";
import { Notice } from "@/components/shared/notice";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { AccountPicker } from "@/features/accounts/components/account-picker";
import { OwnerCell } from "@/features/accounts/components/owner-cell";
import { getAccountTitle } from "@/features/accounts/lib/account-meta";
import type { AdminAccount } from "@/features/accounts/types/accounts.types";
import { PlanCard } from "@/features/plans/components/plan-card";
import { usePlans } from "@/features/plans/hooks/use-plans";
import { useAdminSubscriptionActions } from "../hooks/use-subscriptions";

export function CreateSubscriptionDialog({ account: preset, onClose }: { account?: AdminAccount; onClose: () => void }) {
	const { create } = useAdminSubscriptionActions();
	const [account, setAccount] = useState<AdminAccount | null>(preset ?? null);
	const [planId, setPlanId] = useState<string | null>(null);
	const [cycles, setCycles] = useState("1");
	const [activate, setActivate] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const plans = usePlans(account?.serviceType);
	const isPppoe = account?.serviceType === "pppoe";

	function pickAccount(next: AdminAccount | null) {
		setAccount(next);
		setPlanId(null);
		setError(null);
	}

	async function submit() {
		const cycleCount = Number(cycles);
		if (!account || !planId) {
			setError("Choose an account and a plan");
			return;
		}
		if (isPppoe && (!Number.isInteger(cycleCount) || cycleCount < 1)) {
			setError("Cycles must be a whole number of at least 1");
			return;
		}

		const res = await create.mutateAsync({
			accountId: account.id,
			planId,
			cycles: isPppoe ? cycleCount : undefined,
			activateImmediately: activate,
		});

		if (!res.success) {
			toast.error(res.message);
			return;
		}

		toast.success(activate ? "Subscription activated" : "Subscription created");
		onClose();
	}

	return (
		<Dialog open onOpenChange={(open) => !open && !create.isPending && onClose()}>
			<DialogContent className="max-h-[90svh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Create a subscription</DialogTitle>
					<DialogDescription>Put a customer on a plan directly.</DialogDescription>
				</DialogHeader>

				<div className="space-y-5">
					<Notice
						tone="info"
						title="No payment is recorded here"
						text="If the customer paid you in cash or by transfer, use Record payment on the Payments page instead."
					/>

					{preset ? (
						<div className="card-elevated space-y-1 bg-surface-2 p-3">
							<OwnerCell account={preset} />
							<p className="text-[11px] text-muted-foreground">
								<span className="text-mono">{preset.wsnId}</span> · {getAccountTitle(preset)}
							</p>
						</div>
					) : (
						<Field label="Account" htmlFor="sub-account">
							<AccountPicker value={account} onChange={pickAccount} />
						</Field>
					)}

					{account && (
						<div className="space-y-2">
							<p className="text-sm font-medium">Plan</p>
							{plans.isLoading && <Skeleton className="h-28 rounded-2xl" />}
							{plans.isError && <p className="text-sm text-destructive">We couldn&apos;t load plans.</p>}
							{plans.data && (
								<div role="radiogroup" aria-label="Plans" className="max-h-64 space-y-3 overflow-y-auto p-1">
									{plans.data.map((plan) => (
										<PlanCard
											key={plan.id}
											plan={plan}
											selected={plan.id === planId}
											onSelect={(p) => {
												setPlanId(p.id);
												setError(null);
											}}
										/>
									))}
								</div>
							)}
						</div>
					)}

					{isPppoe && (
						<Field label="Billing cycles" htmlFor="sub-cycles">
							<Input id="sub-cycles" type="number" inputMode="numeric" min={1} value={cycles} onChange={(e) => setCycles(e.target.value)} />
						</Field>
					)}

					<label className="flex items-center gap-2 text-[13px]">
						<Checkbox checked={activate} onCheckedChange={(checked) => setActivate(checked === true)} />
						Activate immediately
					</label>

					{error && (
						<p role="alert" className="text-sm text-destructive">
							{error}
						</p>
					)}

					<Button size="lg" className="w-full" disabled={create.isPending} onClick={submit}>
						{create.isPending && <Loader2 className="animate-spin" />}
						Create subscription
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}

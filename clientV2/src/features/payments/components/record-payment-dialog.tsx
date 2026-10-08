"use client";

import { useState } from "react";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { Field } from "@/components/shared/field";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { AccountPicker } from "@/features/accounts/components/account-picker";
import { OwnerCell } from "@/features/accounts/components/owner-cell";
import { getAccountTitle } from "@/features/accounts/lib/account-meta";
import type { AdminAccount } from "@/features/accounts/types/accounts.types";
import { PlanCard } from "@/features/plans/components/plan-card";
import { usePlans } from "@/features/plans/hooks/use-plans";
import { PAYMENT_CHANNEL_OPTIONS } from "../constants";
import { useRecordPayment } from "../hooks/use-payments";
import { settleFailure } from "@/lib/api/failure";
import { useIdempotencyKey } from "@/lib/api/idempotency";
import { toastWithProvisioning } from "@/features/subscriptions/lib/provisioning";

export function RecordPaymentDialog({ account: preset, onClose }: { account?: AdminAccount; onClose: () => void }) {
	const record = useRecordPayment();
	const [account, setAccount] = useState<AdminAccount | null>(preset ?? null);
	const [planId, setPlanId] = useState<string | null>(null);
	const [cycles, setCycles] = useState("1");
	const [channel, setChannel] = useState("cash");
	const [note, setNote] = useState("");
	const [error, setError] = useState<string | null>(null);
	const idempotencyKey = useIdempotencyKey(`${account?.id}|${planId}|${cycles}|${channel}|${note}`);
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

		const res = await record.mutateAsync({
			accountId: account.id,
			planId,
			cycles: isPppoe ? cycleCount : undefined,
			paymentChannel: channel,
			note: note.trim() || undefined,
			idempotencyKey
		});

		if (!res.success) {
			if (settleFailure(res)) onClose();
			return;
		}

		toastWithProvisioning("Payment recorded", res.data);
		onClose();
	}

	return (
		<Dialog open onOpenChange={(open) => !open && !record.isPending && onClose()}>
			<DialogContent className="max-h-[90svh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Record a payment</DialogTitle>
					<DialogDescription>For cash or bank transfers collected outside the website. It activates the plan straight away.</DialogDescription>
				</DialogHeader>

				<div className="space-y-5">
					{preset ? (
						<div className="card-elevated space-y-1 bg-surface-2 p-3">
							<OwnerCell account={preset} />
							<p className="text-[11px] text-muted-foreground">
								<span className="text-mono">{preset.wsnId}</span> · {getAccountTitle(preset)}
							</p>
						</div>
					) : (
						<Field label="Account" htmlFor="record-account">
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

					<div className="grid gap-4 sm:grid-cols-2">
						<Field label="Payment method" htmlFor="record-channel">
							<Select value={channel} onValueChange={setChannel}>
								<SelectTrigger id="record-channel" className="w-full">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{PAYMENT_CHANNEL_OPTIONS.map((option) => (
										<SelectItem key={option.value} value={option.value}>
											{option.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</Field>
						{isPppoe && (
							<Field label="Billing cycles" htmlFor="record-cycles">
								<Input id="record-cycles" type="number" inputMode="numeric" min={1} value={cycles} onChange={(e) => setCycles(e.target.value)} />
							</Field>
						)}
					</div>

					<Field label="Note (optional)" htmlFor="record-note">
						<Textarea id="record-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Receipt number, who collected it…" />
					</Field>

					{error && (
						<p role="alert" className="text-sm text-destructive">
							{error}
						</p>
					)}

					<Button size="lg" className="w-full" disabled={record.isPending} onClick={submit}>
						{record.isPending && <Loader2 className="animate-spin" />}
						Record payment
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
	
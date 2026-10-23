"use client";

import { StartDateField, startDateToIso } from "./start-date-field";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Notice } from "@/components/shared/notice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import type { Plan } from "@/features/plans/types/plans.types";
import { formatCurrency, formatDateTime, formatDuration } from "@/lib/format";
import { useAdminSubscriptionActions, useUpgradeOptions } from "../hooks/use-subscriptions";
import { getSubscriptionPhase, type SubscriptionAction } from "../lib/subscription-phase";
import type { Subscription } from "../types/subscriptions.types";
import { Field } from "@/components/shared/field";
import { PAYMENT_CHANNEL_OPTIONS } from "@/features/payments/constants";
import { useRecordPayment } from "@/features/payments/hooks/use-payments";
import { toastWithProvisioning } from "../lib/provisioning";
import { SubscriptionUsageDialog } from "@/features/usage/components/subscription-usage-dialog";
import { settleFailure } from "@/lib/api/failure";
import { useIdempotencyKey } from "@/lib/api/idempotency";
import { endedEarly } from "../lib/subscription-phase";


interface DialogProps {
	subscription: Subscription;
	onClose: () => void;
}

const QUICK_DAYS = [1, 3, 7, 30];
const DAY_MS = 86_400_000;

function ReasonField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
	return <Textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder="Reason (optional)" aria-label="Reason" />;
}

function ExtendDialog({ subscription, onClose }: DialogProps) {
	const { extend } = useAdminSubscriptionActions();
	const [days, setDays] = useState("7");
	const [reason, setReason] = useState("");
	const [error, setError] = useState<string | null>(null);
	const idempotencyKey = useIdempotencyKey(`${days}|${reason}`);

	const parsed = Number(days);
	const valid = days.trim() !== "" && Number.isInteger(parsed) && parsed !== 0;
	const active = getSubscriptionPhase(subscription) === "active";
	const preview =
		valid && active && subscription.expiresAt
			? new Date(new Date(subscription.expiresAt).getTime() + parsed * DAY_MS).toISOString()
			: null;

	return (
		<ConfirmDialog
			open
			onOpenChange={(open) => !open && onClose()}
			title="Extend subscription"
			description={`Adjust the time on ${subscription.planSnapshot.name} without taking a payment.`}
			confirmLabel="Apply days"
			onConfirm={async () => {
				if (!valid) {
					setError("Enter a whole number of days, other than 0");
					return false;
				}
				const res = await extend.mutateAsync({
					id: subscription.id,
					days: parsed,
					reason: reason.trim() || undefined,
					idempotencyKey,
				});
				if (!res.success) return settleFailure(res);
				toast.success(`${parsed > 0 ? "Added" : "Removed"} ${Math.abs(parsed)} day${Math.abs(parsed) === 1 ? "" : "s"}`);
			}}
		>
			<div className="space-y-4">
				{getSubscriptionPhase(subscription) === "expired" && (
					<Notice tone="info" title="This subscription has ended" text="Adding days that push the expiry into the future reactivates it. A negative number moves the expiry back, which is how you correct a mistake." />
				)}
				<Notice tone="info" title="This is free time" text="No payment is recorded. If the customer has paid you, use Renew instead." />
				<div className="space-y-2">
					<Label htmlFor="extend-days">Days to add</Label>
					<Input
						id="extend-days"
						type="number"
						inputMode="numeric"
						step={1}
						value={days}
						aria-invalid={!!error}
						onChange={(e) => {
							setDays(e.target.value);
							setError(null);
						}}
					/>
					<div className="flex flex-wrap gap-2">
						{QUICK_DAYS.map((d) => (
							<Button key={d} type="button" variant="outline" size="sm" className="bg-surface-2" onClick={() => { setDays(String(d)); setError(null); }}>
								+{d}
							</Button>
						))}
					</div>
					<p className="text-xs text-muted-foreground">Use a negative number to remove days.</p>
					{preview && <p className="text-[12px] text-muted-foreground">New expiry: {formatDateTime(preview)}</p>}
					{error && (
						<p role="alert" className="text-sm text-destructive">
							{error}
						</p>
					)}
				</div>

				<ReasonField value={reason} onChange={setReason} />
			</div>
		</ConfirmDialog>
	);
}

function RenewDialog({ subscription, onClose }: DialogProps) {
	const record = useRecordPayment();
	const plan = subscription.planSnapshot;
	const isPppoe = plan.serviceType === "pppoe";
	const [channel, setChannel] = useState("cash");
	const [cycles, setCycles] = useState("1");
	const [note, setNote] = useState("");
	const [startDate, setStartDate] = useState("");
	const [error, setError] = useState<string | null>(null);
	const idempotencyKey = useIdempotencyKey(`${subscription.id}|${channel}|${cycles}|${note}|${startDate}`);

	return (
		<ConfirmDialog
			open
			onOpenChange={(open) => !open && onClose()}
			title="Renew subscription"
			description={`Records a payment of ${formatCurrency(plan.price)} per ${formatDuration(plan.durationValue, plan.durationUnit)} for ${plan.name}. Use this when the customer has paid you in cash or by transfer. To give free time instead, use Extend.`}
			confirmLabel="Record payment and renew"
			onConfirm={async () => {
				const count = Number(cycles);
				if (isPppoe && (!Number.isInteger(count) || count < 1)) {
					setError("Enter a whole number of 1 or more");
					return false;
				}

				const start = startDateToIso(startDate);
				if (start.error) {
					setError(start.error);
					return false;
				}

				const res = await record.mutateAsync({
					accountId: subscription.accountId,
					planId: subscription.planId,
					cycles: isPppoe ? count : undefined,
					paymentChannel: channel,
					note: note.trim() || undefined,
					startDate: start.iso,
					idempotencyKey,
				});

				if (!res.success) return settleFailure(res, "The renewal");
				toastWithProvisioning("Subscription renewed", res.data);
			}}
		>
			<div className="space-y-4">
				<Notice
					tone="info"
					title="Click once"
					text="An active subscription gets the new period after its current expiry. One that has ended starts from now. If you see an error, don't click again. Open the subscription and check its payments first."
				/>

				<StartDateField
					id="renew-start-date"
					value={startDate}
					onChange={(value) => {
						setStartDate(value);
						setError(null);
					}}
					hint="Optional. Only accepted when this is the customer's first recorded payment. Leave empty for a normal renewal."
				/>

				<Field label="Payment method" htmlFor="renew-channel">
					<Select value={channel} onValueChange={setChannel}>
						<SelectTrigger id="renew-channel" className="w-full">
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
					<Field label="Billing cycles" htmlFor="renew-cycles" error={error ?? undefined} hint="How many periods the customer paid for.">
						<Input
							id="renew-cycles"
							type="number"
							inputMode="numeric"
							min={1}
							value={cycles}
							aria-invalid={!!error}
							onChange={(e) => {
								setCycles(e.target.value);
								setError(null);
							}}
						/>
					</Field>
				)}

				<Field label="Note (optional)" htmlFor="renew-note">
					<Textarea id="renew-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Receipt number, who collected it…" />
				</Field>
			</div>
		</ConfirmDialog>
	);
}

function ChangePlanDialog({ subscription, onClose }: DialogProps) {
	const { changePlan } = useAdminSubscriptionActions();
	const options = useUpgradeOptions(subscription.accountId);
	const [newPlanId, setNewPlanId] = useState("");
	const idempotencyKey = useIdempotencyKey(newPlanId);

	function renderPicker() {
		if (options.isLoading) return <Skeleton className="h-11 rounded-lg" />;
		if (options.isError) return <p className="text-sm text-destructive">We couldn&apos;t load upgrade options. Close this and try again.</p>;
		if (!options.data || options.data.length === 0) {
			return <p className="text-sm text-muted-foreground">This customer is already on our highest plan, so there's nothing to upgrade to.</p>;
		}

		return (
			<Select value={newPlanId} onValueChange={setNewPlanId}>
				<SelectTrigger className="w-full" aria-label="New plan">
					<SelectValue placeholder="Choose a plan" />
				</SelectTrigger>
				<SelectContent>
					{options.data.map((plan: Plan) => (
						<SelectItem key={plan.id} value={plan.id}>
							{plan.name} · {formatCurrency(plan.price)} · {formatDuration(plan.durationValue, plan.durationUnit)}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		);
	}

	return (
		<ConfirmDialog
			open
			onOpenChange={(open) => !open && onClose()}
			title="Upgrade plan"
			description={`Currently on ${subscription.planSnapshot.name}. Their remaining time carries over and the new plan's full duration is added on top. Moving to a cheaper plan mid-cycle isn't supported.`}
			confirmLabel="Upgrade plan"
			confirmDisabled={!newPlanId}
			onConfirm={async () => {
				const res = await changePlan.mutateAsync({
					id: subscription.id,
					newPlanId,
					idempotencyKey
				});
				if (!res.success) return settleFailure(res);
				toast.success("Plan upgraded");
			}}
		>
			{renderPicker()}
		</ConfirmDialog>
	);
}

function SuspendDialog({ subscription, onClose }: DialogProps) {
	const { suspend } = useAdminSubscriptionActions();
	const [reason, setReason] = useState("");

	return (
		<ConfirmDialog
			open
			onOpenChange={(open) => !open && onClose()}
			destructive
			title="Suspend subscription?"
			description="The customer loses service until you resume it."
			confirmLabel="Suspend"
			onConfirm={async () => {
				const res = await suspend.mutateAsync({ id: subscription.id, reason: reason.trim() || undefined });
				if (!res.success) return settleFailure(res);
				toast.success("Subscription suspended");
			}}
		>
			<ReasonField value={reason} onChange={setReason} />
		</ConfirmDialog>
	);
}

function ResumeDialog({ subscription, onClose }: DialogProps) {
	const { resume } = useAdminSubscriptionActions();

	return (
		<ConfirmDialog
			open
			onOpenChange={(open) => !open && onClose()}
			title="Resume subscription?"
			description="Service is restored and the customer can go back online."
			confirmLabel="Resume"
			onConfirm={async () => {
				const res = await resume.mutateAsync(subscription.id);
				if (!res.success) return settleFailure(res);
				toast.success("Subscription resumed");
			}}
		/>
	);
}

function EndDialog({ subscription, action, onClose }: DialogProps & { action: "cancel" | "force-expire" }) {
	const { cancel, forceExpire } = useAdminSubscriptionActions();
	const [reason, setReason] = useState("");
	const isForce = action === "force-expire";

	return (
		<ConfirmDialog
			open
			onOpenChange={(open) => !open && onClose()}
			destructive
			requireText={isForce ? "expire" : undefined}
			title={isForce ? "Force expire now?" : "Cancel subscription?"}
			description={
				isForce
					? "This ends access immediately and the customer goes offline right now."
					: "The subscription is canceled and won't renew. The customer will need a new plan to get back online."
			}
			confirmLabel={isForce ? "Force expire" : "Cancel subscription"}
			onConfirm={async () => {
				const mutation = isForce ? forceExpire : cancel;
				const res = await mutation.mutateAsync({ id: subscription.id, reason: reason.trim() || undefined });
				if (!res.success) return settleFailure(res);
				toast.success(isForce ? "Subscription expired" : "Subscription canceled");
			}}
		>
			<ReasonField value={reason} onChange={setReason} />
		</ConfirmDialog>
	);
}

interface SubscriptionActionDialogProps extends DialogProps {
	action: SubscriptionAction;
}

export function SubscriptionActionDialog({ action, subscription, onClose }: SubscriptionActionDialogProps) {
	switch (action) {
		case "extend":
			return <ExtendDialog subscription={subscription} onClose={onClose} />;
		case "renew":
			return <RenewDialog subscription={subscription} onClose={onClose} />;
		case "change-plan":
			return <ChangePlanDialog subscription={subscription} onClose={onClose} />;
		case "suspend":
			return <SuspendDialog subscription={subscription} onClose={onClose} />;
		case "resume":
			return <ResumeDialog subscription={subscription} onClose={onClose} />;
		case "cancel":
		
		case "usage":
			return <SubscriptionUsageDialog subscription={subscription} onClose={onClose} />;

		case "force-expire":
			return <EndDialog subscription={subscription} action={action} onClose={onClose} />;
	}
}
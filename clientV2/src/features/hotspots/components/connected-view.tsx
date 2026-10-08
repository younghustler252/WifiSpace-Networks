"use client";

import { CheckCircle2, Wifi } from "lucide-react";
import { StatusMessage } from "@/components/shared/status-message";
import type { ProvisioningState } from "@/features/subscriptions/lib/provisioning";
import type { Subscription } from "@/features/subscriptions/types/subscriptions.types";
import { useCountdown } from "@/hooks/use-countdown";
import { formatDateTime, formatRemaining } from "@/lib/format";
import { cn } from "@/lib/utils";

interface ConnectedViewProps {
	title: string;
	text: string;
	subscription?: Subscription | null;
	provisioning?: ProvisioningState | null;
}

function Stat({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
	return (
		<div className="card-elevated bg-surface-2 p-3 text-left">
			<div className="text-[11px] text-muted-foreground">{label}</div>
			<div className={cn("truncate text-lg", mono ? "text-mono" : "font-medium")}>{value}</div>
		</div>
	);
}

export function ConnectedView({ title, text, subscription, provisioning }: ConnectedViewProps) {
	const expiresAt = subscription?.expiresAt;
	const secondsLeft = useCountdown(expiresAt);
	const planName = subscription?.planSnapshot?.name;
	const sync = subscription?.mikrotikStatus;
	const connecting = provisioning === "pending" || sync === "pending";

	return (
		<StatusMessage
			icon={connecting ? Wifi : CheckCircle2}
			tone={connecting ? "primary" : "success"}
			pulse={connecting}
			title={connecting ? "Switching your internet on…" : title}
			text={connecting ? "Your plan is active and we're connecting you now. This usually takes a few seconds." : text}
		>
			{(planName || expiresAt) && (
				<div className="grid grid-cols-2 gap-3">
					{planName && <Stat label="Plan" value={planName} />}
					{expiresAt && <Stat label="Time left" value={formatRemaining(secondsLeft)} mono />}
				</div>
			)}
			{expiresAt && <p className="text-xs text-muted-foreground">Expires {formatDateTime(expiresAt)}</p>}
			{sync === "failed" && (
				<p className="text-xs text-destructive">
					We&apos;re having trouble switching your internet on. If it doesn&apos;t work shortly, please contact support.
				</p>
			)}
		</StatusMessage>
	);
}
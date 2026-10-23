"use client";

import { CheckCircle2, Globe } from "lucide-react";
import { StatusMessage } from "@/components/shared/status-message";
import { Button } from "@/components/ui/button";
import { useCountdown } from "@/hooks/use-countdown";
import { formatDateTime, formatRemaining } from "@/lib/format";
import { cn } from "@/lib/utils";

interface ConnectedViewProps {
	title: string;
	text: string;
	planName?: string | null;
	expiresAt?: string | null;
	linkOrig?: string;
}

const FALLBACK_URL = "https://www.google.com";

function Stat({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
	return (
		<div className="card-elevated bg-surface-2 p-3 text-left">
			<div className="text-[11px] text-muted-foreground">{label}</div>
			<div className={cn("truncate text-lg", mono ? "text-mono" : "font-medium")}>{value}</div>
		</div>
	);
}

export function ConnectedView({ title, text, planName, expiresAt, linkOrig }: ConnectedViewProps) {
	const secondsLeft = useCountdown(expiresAt);

	return (
		<StatusMessage icon={CheckCircle2} tone="success" title={title} text={text}>
			{(planName || expiresAt) && (
				<div className="grid grid-cols-2 gap-3">
					{planName && <Stat label="Plan" value={planName} />}
					{expiresAt && <Stat label="Time left" value={formatRemaining(secondsLeft)} mono />}
				</div>
			)}
			{expiresAt && <p className="text-xs text-muted-foreground">Expires {formatDateTime(expiresAt)}</p>}
			<Button asChild size="lg" className="w-full">
				<a href={linkOrig ?? FALLBACK_URL}>
					<Globe />
					Start browsing
				</a>
			</Button>
		</StatusMessage>
	);
}

"use client";

import { Clock, Wifi, XCircle } from "lucide-react";
import { StatusMessage } from "@/components/shared/status-message";
import { Button } from "@/components/ui/button";
import { useConnectionStatus } from "../hooks/use-hotspots";
import { ConnectedView } from "./connected-view";
import { buildSupportMessage } from "../lib/support";
import type { HotspotRouter } from "../types/hotspots.types";
import { ProgressSteps } from "./progress-steps";
import { SupportButton } from "./support-link";

const STEPS = ["Confirming your payment", "Switching on your internet", "You're online"];

interface ConnectingViewProps {
	reference: string;
	macAddress: string;
	linkOrig?: string;
	router?: HotspotRouter | null;
	onTryAgain: () => void;
}

export function ConnectingView({ reference, macAddress, linkOrig, router, onTryAgain }: ConnectingViewProps) {
	const support = (issue: string) => buildSupportMessage({ issue, location: router?.location ?? router?.name, routerCode: router?.code, reference, macAddress });
	const { stage, connected, paymentFailed, activationFailed, timedOut, expiresAt, restart } = useConnectionStatus(reference, macAddress);

	if (connected) {
		return <ConnectedView title="You're online!" text="You can close this page and start browsing." expiresAt={expiresAt} linkOrig={linkOrig} />;
	}

	if (paymentFailed) {
		return (
			<StatusMessage icon={XCircle} tone="destructive" title="Payment didn't go through" text="You haven't been charged for this attempt. Pick a plan to try again.">
				<Button size="lg" className="w-full" onClick={onTryAgain}>
					Try again
				</Button>
				<SupportButton message={support("My payment didn't go through.")} />
			</StatusMessage>
		);
	}

	if (activationFailed) {
		return (
			<StatusMessage
				icon={XCircle}
				tone="warning"
				title="Paid, but not switched on yet"
				text="Your payment went through and your plan is safe. We couldn't switch your internet on automatically. Tap check again, or contact support with the reference below."
			>
				<p className="text-mono text-xs text-muted-foreground">Reference: {reference}</p>
				<Button size="lg" className="w-full" onClick={restart}>
					Check again
				</Button>
				<SupportButton message={support("I paid but my internet isn't switched on.")} />
			</StatusMessage>
		);
	}

	if (timedOut) {
		return (
			<StatusMessage icon={Clock} tone="warning" title="Still working on it" text="This is taking longer than usual. If you've paid, your internet will switch on automatically.">
				<p className="text-mono text-xs text-muted-foreground">Reference: {reference}</p>
				<Button size="lg" className="w-full" onClick={restart}>
					Check again
				</Button>
				<Button size="lg" variant="outline" className="w-full bg-surface-2" onClick={onTryAgain}>
					Back to plans
				</Button>
				<SupportButton message={support("I paid but my internet is taking too long to switch on.")} />
			</StatusMessage>
		);
	}

	const current = stage === "provisioning" ? 1 : 0;

	return (
		<StatusMessage icon={Wifi} pulse title={current === 0 ? "Confirming your payment…" : "Switching your internet on…"} text="Keep this page open. It usually takes a few seconds.">
			<ProgressSteps steps={STEPS} current={current} />
			<p className="text-mono text-xs text-muted-foreground">Reference: {reference}</p>
		</StatusMessage>
	);
}

interface ActivatingViewProps {
	timedOut: boolean;
	onCheckAgain: () => void;
}

export function ActivatingView({ timedOut, onCheckAgain }: ActivatingViewProps) {
	if (timedOut) {
		return (
			<StatusMessage icon={Clock} tone="warning" title="Still setting things up" text="Your plan is active but your internet isn't on yet. Tap check again, or ask staff nearby for help.">
				<Button size="lg" className="w-full" onClick={onCheckAgain}>
					Check again
				</Button>
			</StatusMessage>
		);
	}

	return (
		<StatusMessage icon={Wifi} pulse title="Switching your internet on…" text="Your plan is active. This usually takes a few seconds.">
			<ProgressSteps steps={STEPS} current={1} />
		</StatusMessage>
	);
}

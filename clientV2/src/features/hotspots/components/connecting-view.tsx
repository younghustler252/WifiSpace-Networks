"use client";

import { Clock, Wifi, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useConnectionStatus } from "../hooks/use-hotspots";
import { ConnectedView } from "./connected-view";
import { StatusMessage } from "../../../components/shared/status-message";

interface ConnectingViewProps {
	reference: string;
	macAddress: string;
	onTryAgain: () => void;
}

export function ConnectingView({ reference, macAddress, onTryAgain }: ConnectingViewProps) {
	const { connected, failed, timedOut, restart } = useConnectionStatus(reference, macAddress);

	if (connected) {
		return <ConnectedView title="You're online!" text="You can close this page and start browsing." />;
	}

	if (failed) {
		return (
			<StatusMessage
				icon={XCircle}
				tone="destructive"
				title="Payment didn't go through"
				text="We couldn't confirm your payment. Pick a plan to try again."
			>
				<Button size="lg" className="w-full" onClick={onTryAgain}>
					Try again
				</Button>
			</StatusMessage>
		);
	}

	if (timedOut) {
		return (
			<StatusMessage
				icon={Clock}
				tone="warning"
				title="Still activating"
				text="This is taking longer than usual. If you've paid, your internet will switch on automatically."
			>
				<Button size="lg" className="w-full" onClick={restart}>
					Check again
				</Button>
				<Button size="lg" variant="outline" className="w-full bg-surface-2" onClick={onTryAgain}>
					Back to plans
				</Button>
			</StatusMessage>
		);
	}

	return (
		<StatusMessage
			icon={Wifi}
			pulse
			title="Connecting you…"
			text="Confirming your payment and switching on your internet. This usually takes a few seconds."
		/>
	);
}
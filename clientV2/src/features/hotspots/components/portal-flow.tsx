"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MapPinOff, Unplug, Wifi, WifiOff, XCircle } from "lucide-react";
import { StatusMessage } from "@/components/shared/status-message";
import { Button } from "@/components/ui/button";
import { usePollWindow } from "@/hooks/use-poll-window";
import { ACTIVATION_MAX_WAIT_MS, useHotspotSession } from "../hooks/use-hotspots";
import { usePortalParams } from "../hooks/use-portal-params";
import { ConnectedView } from "./connected-view";
import { ActivatingView, ConnectingView } from "./connecting-view";
import { PlanPicker } from "./plan-picker";
import { PortalLoginForm } from "./portal-login-form";

export function PortalFlow() {
	const nav = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const { client, reference, linkOrig } = usePortalParams();
	const [view, setView] = useState<"main" | "login">("main");
	const [loginEmail, setLoginEmail] = useState("");
	const activation = usePollWindow(ACTIVATION_MAX_WAIT_MS);
	const session = useHotspotSession(client, activation.isOpen);

	function clearReference() {
		const next = new URLSearchParams(searchParams.toString());
		next.delete("reference");
		next.delete("trxref");
		nav.replace(`${pathname}?${next.toString()}`);
	}

	function checkAgain() {
		activation.restart();
		session.refetch();
	}

	if (!client) {
		return (
			<StatusMessage
				icon={MapPinOff}
				tone="warning"
				title="Connect to the wifi first"
				text="Join the WifiSpace wifi network on your device and this page will open automatically."
			/>
		);
	}

	if (reference) {
		return <ConnectingView reference={reference} macAddress={client.macAddress} linkOrig={linkOrig} onTryAgain={clearReference} />;
	}

	if (session.isError) {
		return (
			<StatusMessage icon={WifiOff} tone="warning" title="We couldn't reach the network" text="Check that you're connected to the WifiSpace wifi, then try again.">
				<Button size="lg" className="w-full" onClick={() => session.refetch()}>
					Try again
				</Button>
			</StatusMessage>
		);
	}

	const data = session.data;

	if (!data || data.state === "PENDING") {
		return <StatusMessage icon={Wifi} pulse title="Checking your connection…" />;
	}

	if (!data.router) {
		return (
			<StatusMessage icon={Unplug} tone="destructive" title="We can't identify this hotspot" text="This wifi spot isn't set up correctly yet. Please let a member of staff know.">
				<Button size="lg" variant="outline" className="w-full bg-surface-2" onClick={() => session.refetch()}>
					Try again
				</Button>
			</StatusMessage>
		);
	}

	if (data.state === "ACTIVE") {
		return (
			<ConnectedView
				title="You're connected"
				text="Your internet is active. Enjoy browsing."
				planName={data.subscription?.planSnapshot?.name}
				expiresAt={data.subscription?.expiresAt}
				linkOrig={linkOrig}
			/>
		);
	}

	if (data.state === "ACTIVATING") {
		return <ActivatingView timedOut={activation.expired} onCheckAgain={checkAgain} />;
	}

	if (data.state === "ACTIVATION_FAILED") {
		return (
			<StatusMessage
				icon={XCircle}
				tone="warning"
				title="Your plan is paid, but we couldn't switch you on"
				text="Your plan is safe. Tap check again, and if it still doesn't work, please tell a member of staff."
			>
				{data.subscription?.id && <p className="text-mono text-xs text-muted-foreground">Reference: {data.subscription.id.slice(-8).toUpperCase()}</p>}
				<Button size="lg" className="w-full" onClick={checkAgain}>
					Check again
				</Button>
			</StatusMessage>
		);
	}

	return (
		<>
			<div hidden={view === "login"}>
				<PlanPicker
					client={client}
					router={data.router}
					isNewDevice={data.state === "UNKNOWN_DEVICE"}
					knownEmail={data.user?.email}
					firstNameKnown={data.user?.firstName}
					onLogin={() => {
						setLoginEmail("");
						setView("login");
					}}
					onExistingUser={(email) => {
						setLoginEmail(email);
						setView("login");
					}}
				/>
			</div>
			{view === "login" && <PortalLoginForm client={client} defaultEmail={loginEmail} onBack={() => setView("main")} />}
		</>
	);
}

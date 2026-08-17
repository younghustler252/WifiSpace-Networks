"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { useHotspotSession, useRevokeHotspotSession } from "@/features/hotspot/hooks/useHotspot";
import { HotspotLoading } from "@/features/hotspot/components/hotspot-loading";
import { HotspotLanding } from "@/features/hotspot/components/hotspot-landing";
import { HotspotConnected } from "@/features/hotspot/components/hotspot-connected";
import { HotspotPlanSelect } from "@/features/hotspot/components/hotspot-plan-select";
import { HotspotLogin } from "@/features/hotspot/components/hotspot-login";
import { shouldShowHotspotGuide, HotspotGuideModal } from "@/features/hotspot/components/hotspot-guide-modal";
// CHANGED: no HotspotLayout import/wrap here anymore — app/hotspot/layout.tsx
// already applies to every page under app/hotspot/* automatically per
// Next.js App Router convention. This file returns content only.

interface RouterContext {
	macAddress: string | null;
	ipAddress: string | null;
	identity: string | null;
	servername: string | null;
	hostname: string | null;
}

type View = "landing" | "login" | "plans" | "connected";

export default function HotspotPortalPage() {
	const searchParams = useSearchParams();

	const routerContext: RouterContext = useMemo(() => ({
		macAddress: searchParams.get("mac"),
		ipAddress: searchParams.get("ip"),
		identity: searchParams.get("identity"),
		servername: searchParams.get("servername"),
		hostname: searchParams.get("hostname")
	}), [searchParams]);

	const [view, setView] = useState<View>("landing");
	const [loginPrefillEmail, setLoginPrefillEmail] = useState<string | undefined>(undefined);
	const [loginContextMessage, setLoginContextMessage] = useState<string | undefined>(undefined);

	// NEW: guide modal. Starts false and flips in an effect (not the
	// initializer) to avoid an SSR/client hydration mismatch — localStorage
	// doesn't exist on the server.
	const [showGuide, setShowGuide] = useState(false);
	useEffect(() => {
		setShowGuide(shouldShowHotspotGuide());
	}, []);

	const sessionQuery = useHotspotSession({
		macAddress: routerContext.macAddress ?? undefined
	});
	const revoke = useRevokeHotspotSession();

	if (!routerContext.macAddress) {
		return (
			<div className="ui-card !p-4 text-sm text-muted-foreground">
				We couldn't detect your device. Please reconnect to the WifiSpace
				network and try again.
			</div>
		);
	}

	if (sessionQuery.isLoading) {
		return <HotspotLoading />;
	}

	const session = sessionQuery.data;

	if (session?.trustedDevice && session.hasActiveSubscription) {
		return (
			<HotspotConnected
				account={session.account}
				subscription={session.subscription}
				plan={session.plan}
				isLoggingOut={revoke.isPending}
				onLogout={() => {
					// ASSUMPTION: RevokeHotspotSessionDto.token — see chat, needs
					// confirming against the real RevokeHotspotSession usecase.
					if (!session.identity?.id) return;
					revoke.mutate({ token: session.identity.id });
				}}
			/>
		);
	}

	const effectiveView: View =
		session?.trustedDevice && !session.hasActiveSubscription ? "plans" : view;

	return (
		<>
			{effectiveView === "landing" && (
				<>
					<HotspotGuideModal open={showGuide} onClose={() => setShowGuide(false)} />
					<HotspotLanding
						routerName={routerContext.identity}
						onGetStarted={() => setView("plans")}
						onSignIn={() => setView("login")}
					/>
				</>
			)}

			{effectiveView === "login" && (
				<HotspotLogin
					routerContext={routerContext}
					prefillEmail={loginPrefillEmail}
					contextMessage={loginContextMessage}
					onAuthenticated={() => sessionQuery.refetch()}
				/>
			)}

			{effectiveView === "plans" && (
				<HotspotPlanSelect
					routerContext={{
						macAddress: routerContext.macAddress,
						ipAddress: routerContext.ipAddress,
						identity: routerContext.identity
					}}
					knownUser={session?.user ?? null}
					onRequiresLogin={(email, message) => {
						setLoginPrefillEmail(email);
						setLoginContextMessage(message);
						setView("login");
					}}
				/>
			)}
		</>
	);
}
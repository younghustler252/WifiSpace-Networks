"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useConfirmHotspotPurchase } from "@/features/hotspot/hooks/useHotspot";

// This is a real redirect target (Paystack sends the browser here with its
// own ?reference=), separate from the main /hotspot page — that's why it's
// its own route rather than a state in the portal's state machine.

type Status = "confirming" | "connected" | "pending_activation" | "failed";

export default function HotspotCallbackPage() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const reference = searchParams.get("reference");

	const confirmPurchase = useConfirmHotspotPurchase();
	const [status, setStatus] = useState<Status>("confirming");
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	// Guard against double-firing in React Strict Mode / re-renders — this
	// call has real side effects (runs business logic), not just a read.
	const hasConfirmed = useRef(false);

	useEffect(() => {
		if (!reference || hasConfirmed.current) return;
		hasConfirmed.current = true;

		confirmPurchase.mutate(
			{ reference },
			{
				onSuccess: (data) => {
					if (data.autoConnected) {
						setStatus("connected");
					} else {
						// Payment succeeded but router activation didn't complete
						// (or we can't tell — see the alreadyProcessed case in
						// hotspot.types.ts). Don't claim they're connected if
						// we're not sure.
						setStatus("pending_activation");
					}
				},
				onError: (err) => {
					setStatus("failed");
					setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
				}
			}
		);
	}, [reference, confirmPurchase]);

	if (!reference) {
		return (
			<div className="ui-card !p-4 text-sm text-muted-foreground">
				Missing payment reference. If you just paid, check your email for a
				receipt and contact support.
			</div>
		);
	}

	if (status === "confirming") {
		return (
			<div className="py-8 space-y-4 text-center">
				<div className="w-10 h-10 mx-auto border-2 rounded-full border-border border-t-accent animate-spin" />
				<p className="text-sm text-muted-foreground">Confirming your payment…</p>
			</div>
		);
	}

	if (status === "connected") {
		return (
			<div className="space-y-6 text-center">
				<div className="flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-success/15">
					<svg viewBox="0 0 24 24" className="w-8 h-8 text-success" fill="none" stroke="currentColor" strokeWidth={2}>
						<path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
					</svg>
				</div>
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">You're online</h1>
					<p className="mt-1 text-sm text-muted-foreground">Payment confirmed and your connection is active.</p>
				</div>
				<button className="w-full ui-button ui-button-accent" onClick={() => router.push("/hotspot")}>
					Continue
				</button>
			</div>
		);
	}

	if (status === "pending_activation") {
		return (
			<div className="space-y-4 text-center">
				<h1 className="text-xl font-semibold tracking-tight">Payment received</h1>
				<p className="text-sm text-muted-foreground">
					We're still connecting your device. This can take a moment — try
					refreshing, or contact support if it doesn't resolve shortly.
				</p>
				<button className="w-full ui-button-outline" onClick={() => router.push("/hotspot")}>
					Check status
				</button>
			</div>
		);
	}

	return (
		<div className="space-y-4 text-center">
			<h1 className="text-xl font-semibold tracking-tight">Payment couldn't be confirmed</h1>
			<p className="text-sm text-danger">{errorMessage}</p>
			<button className="w-full ui-button-outline" onClick={() => router.push("/hotspot")}>
				Back
			</button>
		</div>
	);
}
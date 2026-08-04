"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import Card, { CardContent } from "@/components/ui/Card";

// CHANGED: replaces paymentApi.resolve() + redirect indirection with a
// direct confirm, same pattern as /hotspot/callback. Adjust this import path
// to wherever you placed usePayment.ts.
import { useConfirmPayment } from "@/features/payment/hooks/usePayment";

type Status = "confirming" | "success" | "pending_activation" | "failed";

export default function PaymentCallbackPage() {
	const params = useSearchParams();
	const router = useRouter();
	const reference = params.get("reference");

	const confirmPayment = useConfirmPayment();
	const [status, setStatus] = useState<Status>("confirming");
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	// Guard against double-firing in Strict Mode — this call runs real
	// business logic, not just a read.
	const hasConfirmed = useRef(false);

	useEffect(() => {
		if (!reference || hasConfirmed.current) return;
		hasConfirmed.current = true;

		confirmPayment.mutate(
			{ reference },
			{
				onSuccess: (data) => {
					// autoConnected is a generic field now — it reflects
					// whether networkService.activate() succeeded, regardless
					// of hotspot vs PPPoE. "Still setting up" here covers
					// either case honestly rather than claiming success
					// prematurely.
					setStatus(data.autoConnected ? "success" : "pending_activation");
				},
				onError: (err) => {
					setStatus("failed");
					setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
				}
			}
		);
	}, [reference, confirmPayment]);

	function retry() {
		if (!reference) return;
		setStatus("confirming");
		confirmPayment.mutate(
			{ reference },
			{
				onSuccess: (data) => {
					setStatus(data.autoConnected ? "success" : "pending_activation");
				},
				onError: (err) => {
					setStatus("failed");
					setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
				}
			}
		);
	}

	if (!reference) {
		return (
			<div className="flex items-center justify-center min-h-screen px-4 bg-background">
				<Card className="w-full max-w-md text-center">
					<CardContent className="py-10 space-y-5">
						<h2 className="text-xl font-semibold">Missing payment reference</h2>
						<p className="text-sm text-muted-foreground">
							If you just paid, check your email for a receipt and contact support.
						</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="flex items-center justify-center min-h-screen px-4 bg-background">
			<Card className="w-full max-w-md text-center">
				<CardContent className="py-10 space-y-5">
					{status === "confirming" && (
						<>
							<div className="mx-auto border-4 rounded-full w-14 h-14 border-accent border-t-transparent animate-spin" />
							<div>
								<h2 className="text-xl font-semibold">Confirming payment</h2>
								<p className="text-sm text-muted-foreground">Please wait a moment...</p>
							</div>
						</>
					)}

					{status === "success" && (
						<>
							<div className="flex items-center justify-center mx-auto rounded-full w-14 h-14 bg-success/15">
								<svg viewBox="0 0 24 24" className="h-7 w-7 text-success" fill="none" stroke="currentColor" strokeWidth={2}>
									<path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
								</svg>
							</div>
							<div>
								<h2 className="text-xl font-semibold">Payment confirmed</h2>
								<p className="text-sm text-muted-foreground">Your subscription is now active.</p>
							</div>
							<button
								className="w-full font-medium rounded-lg h-11 bg-accent text-accent-foreground hover:bg-accent-hover"
								onClick={() => router.push("/dashboard")}
							>
								Go to dashboard
							</button>
						</>
					)}

					{status === "pending_activation" && (
						<>
							<div>
								<h2 className="text-xl font-semibold">Payment received</h2>
								<p className="mt-1 text-sm text-muted-foreground">
									We're still setting up your subscription. This can take a moment —
									try checking again, or contact support if it doesn't resolve shortly.
								</p>
							</div>
							<button
								className="w-full font-medium rounded-lg h-11 bg-accent text-accent-foreground hover:bg-accent-hover"
								onClick={retry}
								disabled={confirmPayment.isPending}
							>
								{confirmPayment.isPending ? "Checking…" : "Try again"}
							</button>
							<button
								className="w-full font-medium border rounded-lg h-11 border-border"
								onClick={() => router.push("/dashboard")}
							>
								Go to dashboard
							</button>
						</>
					)}

					{status === "failed" && (
						<>
							<div>
								<h2 className="text-xl font-semibold">Payment couldn't be confirmed</h2>
								<p className="mt-1 text-sm text-danger">{errorMessage}</p>
							</div>
							<button
								className="w-full font-medium border rounded-lg h-11 border-border"
								onClick={() => router.push("/dashboard")}
							>
								Back to dashboard
							</button>
						</>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
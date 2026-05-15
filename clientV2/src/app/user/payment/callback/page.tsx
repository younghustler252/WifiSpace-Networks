"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { paymentApi } from "@/lib/api/payment";

import Card, {
	CardHeader,
	CardContent,
	CardFooter,
} from "@/components/ui/Card";

import Button from "@/components/ui/Button";

export default function PaymentCallbackPage() {
	const params = useSearchParams();
	const router = useRouter();

	const reference = params.get("reference");

	const [status, setStatus] = useState<
		"loading" | "success" | "error"
	>("loading");

	// ===============================
	// VERIFY PAYMENT
	// ===============================
	const { mutate: confirmPayment } = useMutation({
		mutationFn: paymentApi.confirm,
		onSuccess: () => {
			setStatus("success");

			// auto redirect after success
			setTimeout(() => {
				router.push("/dashboard?payment=success");
			}, 2000);
		},
		onError: () => {
			setStatus("error");
		},
	});

	// ===============================
	// RUN ON LOAD
	// ===============================
	useEffect(() => {
		if (!reference) {
			setStatus("error");
			return;
		}

		confirmPayment({ transactionId: reference });
	}, [reference]);

	// ===============================
	// UI STATES
	// ===============================

	if (status === "loading") {
		return (
			<div className="min-h-screen flex items-center justify-center bg-background">
				<Card className="w-full max-w-md text-center animate-pulse">
					<CardContent className="space-y-4">
						<div className="w-12 h-12 mx-auto rounded-full border-4 border-accent border-t-transparent animate-spin" />

						<h2 className="text-lg font-semibold">
							Verifying Payment
						</h2>

						<p className="text-sm text-muted-foreground">
							Please wait while we confirm your transaction...
						</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (status === "success") {
		return (
			<div className="min-h-screen flex items-center justify-center bg-background">
				<Card className="w-full max-w-md text-center border-green-500/30 bg-green-500/5">
					<CardContent className="space-y-4 py-10">
						<div className="w-14 h-14 mx-auto rounded-full bg-green-500/20 flex items-center justify-center text-green-600 text-2xl">
							✓
						</div>

						<h2 className="text-xl font-bold text-green-600">
							Payment Successful
						</h2>

						<p className="text-sm text-muted-foreground">
							Your subscription has been activated successfully.
						</p>

						<p className="text-xs text-muted-foreground">
							Redirecting to dashboard...
						</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (status === "error") {
		return (
			<div className="min-h-screen flex items-center justify-center bg-background">
				<Card className="w-full max-w-md text-center border-red-500/30 bg-red-500/5">
					<CardContent className="space-y-4 py-10">
						<div className="w-14 h-14 mx-auto rounded-full bg-red-500/20 flex items-center justify-center text-red-600 text-2xl">
							✕
						</div>

						<h2 className="text-xl font-bold text-red-600">
							Payment Failed
						</h2>

						<p className="text-sm text-muted-foreground">
							We couldn’t verify your payment. Please try again.
						</p>

						<div className="flex gap-3 justify-center mt-4">
							<Button
								variant="primary"
								onClick={() => router.push("user/plans")}
							>
								Try Again
							</Button>

							<Button
								variant="ghost"
								onClick={() => router.push("/dashboard")}
							>
								Dashboard
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return null;
}
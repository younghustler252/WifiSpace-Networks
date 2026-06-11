"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import Card, { CardContent } from "@/components/ui/Card";
import { paymentApi } from "@/lib/api/payment";

export default function PaymentSuccessPage() {
	const params = useSearchParams();
	const router = useRouter();

	const reference = params.get("reference");
	const hasRun = useRef(false);

	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);

	useEffect(() => {
		if (!reference || hasRun.current) return;

		hasRun.current = true;

		const confirmPayment = async () => {
			try {
				setLoading(true);

				await paymentApi.confirm({
					reference,
				});

				setLoading(false);
			} catch (err) {
				console.error(err);
				setError(true);

				router.replace("/payment/error");
			}
		};

		confirmPayment();
	}, [reference, router]);

	// Optional: if no reference at all
	if (!reference) {
		router.replace("/payment/error");
		return null;
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-background px-4">
			<Card className="w-full max-w-md text-center">
				<CardContent className="space-y-5 py-10">
					{loading && !error && (
						<>
							<div className="w-14 h-14 mx-auto rounded-full border-4 border-green-500 border-t-transparent animate-spin" />

							<div>
								<h2 className="text-xl font-semibold">
									Confirming Payment
								</h2>

								<p className="text-sm text-muted-foreground">
									Please wait while we verify your payment...
								</p>
							</div>
						</>
					)}

					{!loading && !error && (
						<>
							<div className="w-14 h-14 mx-auto rounded-full bg-green-500 flex items-center justify-center text-white text-2xl">
								✓
							</div>

							<div>
								<h2 className="text-xl font-semibold">
									Payment Successful
								</h2>

								<p className="text-sm text-muted-foreground">
									Your payment has been confirmed.
								</p>
							</div>
						</>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
"use client";

import { useEffect, useRef } from "react";
import {
	useSearchParams,
	useRouter
} from "next/navigation";

import Card, {
	CardContent
} from "@/components/ui/Card";

import { paymentApi } from "@/lib/api/payment";

export default function PaymentCallbackPage() {

	const params = useSearchParams();
	const router = useRouter();

	const reference =
		params.get("reference");

	const hasRun =
		useRef(false);

	useEffect(() => {

		if (
			!reference ||
			hasRun.current
		) {
			return;
		}

		hasRun.current = true;

		const resolvePayment =
			async () => {

				try {

					const response =
						await paymentApi.resolve({
							reference
						});

					const redirectTo =
						response.data.redirectTo;

					router.replace(
						`${redirectTo}?reference=${reference}`
					);

				} catch (error) {

					console.error(error);

					router.replace(
						"/payment/error"
					);
				}
			};

		resolvePayment();

	}, [reference]);

	return (
		<div className="min-h-screen flex items-center justify-center bg-background px-4">

			<Card className="w-full max-w-md text-center">

				<CardContent className="space-y-5 py-10">

					<div className="w-14 h-14 mx-auto rounded-full border-4 border-accent border-t-transparent animate-spin" />

					<div>
						<h2 className="text-xl font-semibold">
							Preparing Payment
						</h2>

						<p className="text-sm text-muted-foreground">
							Please wait while we redirect you...
						</p>
					</div>

				</CardContent>

			</Card>

		</div>
	);
}
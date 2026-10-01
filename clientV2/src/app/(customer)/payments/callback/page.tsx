import { Suspense } from "react";
import type { Metadata } from "next";
import { PaymentResult } from "@/features/payments/components/payment-result";

export const metadata: Metadata = { title: "Payment" };

export default function PaymentCallbackPage() {
	return (
		<Suspense>
			<PaymentResult />
		</Suspense>
	);
}
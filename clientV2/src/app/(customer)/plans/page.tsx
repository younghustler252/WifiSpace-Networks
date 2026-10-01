import { Suspense } from "react";
import type { Metadata } from "next";
import { PlanCheckout } from "@/features/payments/components/plan-checkout";

export const metadata: Metadata = { title: "Plans" };

export default function PlansPage() {
	return (
		<Suspense>
			<PlanCheckout />
		</Suspense>
	);
}
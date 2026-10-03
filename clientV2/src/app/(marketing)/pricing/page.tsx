import { Suspense } from "react";
import type { Metadata } from "next";
import { Activity, Bell, CreditCard, Zap, type LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { CtaBand } from "@/features/marketing/components/cta-band";
import { Faq } from "@/features/marketing/components/faq";
import { PricingFromQuery } from "@/features/marketing/components/pricing-from-query";
import { Container } from "@/features/marketing/components/section";
import { getPublicPlans } from "@/lib/api/public-plans";

export const metadata: Metadata = {
	title: "Pricing",
	description: "Simple, upfront plans for home internet and WifiSpace hotspots. Prices in naira, with speed, data and device limits shown on every plan.",
};

export const revalidate = 300;

const INCLUDED: { icon: LucideIcon; label: string }[] = [
	{ icon: Zap, label: "Instant activation" },
	{ icon: Activity, label: "Live usage tracking" },
	{ icon: CreditCard, label: "Secure Paystack checkout" },
	{ icon: Bell, label: "Payment and expiry alerts" },
];

export default async function PricingPage() {
	const [home, hotspot] = await Promise.all([getPublicPlans("pppoe"), getPublicPlans("hotspot")]);

	return (
		<>
			<section className="relative overflow-hidden">
				<div className="absolute inset-0 grid-bg opacity-40 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
				<Container className="relative py-16 text-center md:py-20">
					<p className="mb-3 text-[11px] font-medium uppercase tracking-[0.18em] text-signal">Pricing</p>
					<h1 className="text-3xl font-semibold tracking-tight md:text-5xl">Simple plans, no surprises</h1>
					<p className="mx-auto mt-4 max-w-xl text-[15px] text-muted-foreground md:text-base">
						Every plan shows its speed, data and device limits up front. Prices are in naira.
					</p>
				</Container>
			</section>

			<section className="pb-16 md:pb-24">
				<Container>
					<Suspense fallback={<Skeleton className="mx-auto h-96 max-w-4xl rounded-xl" />}>
						<PricingFromQuery home={home} hotspot={hotspot} />
					</Suspense>

					<ul className="mx-auto mt-14 grid max-w-3xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
						{INCLUDED.map((item) => (
							<li key={item.label} className="flex items-center gap-2.5 text-[13px] text-muted-foreground">
								<item.icon className="size-4 shrink-0 text-signal" />
								{item.label}
							</li>
						))}
					</ul>
				</Container>
			</section>

			<Faq />
			<CtaBand />
		</>
	);
}
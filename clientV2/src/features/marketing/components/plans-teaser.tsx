import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Plan } from "@/features/plans/types/plans.types";
import { PricingTabs } from "./pricing-tabs";
import { Section } from "./section";

export function PlansTeaser({ home, hotspot }: { home: Plan[] | null; hotspot: Plan[] | null }) {
	if (!home && !hotspot) return null;

	return (
		<Section
			eyebrow="Pricing"
			title="Simple, upfront pricing"
			description="Pick the plan that fits how you use the internet. Prices are in naira."
			className="bg-sidebar"
		>
			<PricingTabs home={home} hotspot={hotspot} limit={3} />
			<div className="mt-10 flex justify-center">
				<Button asChild size="lg" variant="outline" className="bg-surface-2">
					<Link href="/pricing">See all plans</Link>
				</Button>
			</div>
		</Section>
	);
}
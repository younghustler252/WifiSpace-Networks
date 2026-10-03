import type { Metadata } from "next";
import { company } from "@/config/company";
import { ConnectionOptions } from "@/features/marketing/components/connection-options";
import { CtaBand } from "@/features/marketing/components/cta-band";
import { Faq } from "@/features/marketing/components/faq";
import { FeatureGrid } from "@/features/marketing/components/feature-grid";
import { Hero } from "@/features/marketing/components/hero";
import { HowItWorks } from "@/features/marketing/components/how-it-works";
import { PlansTeaser } from "@/features/marketing/components/plans-teaser";
import { getPublicPlans } from "@/lib/api/public-plans";

export const metadata: Metadata = {
	title: { absolute: `${company.name} · ${company.tagline}` },
	description: company.description,
};

export const revalidate = 300;

export default async function HomePage() {
	const [home, hotspot] = await Promise.all([getPublicPlans("pppoe"), getPublicPlans("hotspot")]);

	return (
		<>
			<Hero />
			<ConnectionOptions />
			<HowItWorks />
			<FeatureGrid />
			<PlansTeaser home={home} hotspot={hotspot} />
			<Faq />
			<CtaBand />
		</>
	);
}
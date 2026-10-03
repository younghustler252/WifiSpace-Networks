"use client";

import Link from "next/link";
import { Notice } from "@/components/shared/notice";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getBestValueId } from "@/features/plans/lib/best-value";
import type { Plan } from "@/features/plans/types/plans.types";
import { PricingCard } from "./pricing-card";

type Kind = "pppoe" | "hotspot";

interface PlanListProps {
	plans: Plan[] | null;
	kind: Kind;
	limit?: number;
}

function PlanList({ plans, kind, limit }: PlanListProps) {
	if (plans === null) {
		return <p className="card-elevated bg-surface-2 p-6 text-center text-sm text-muted-foreground">We can&apos;t show plans right now. Please try again shortly.</p>;
	}

	if (plans.length === 0) {
		return <p className="card-elevated bg-surface-2 p-6 text-center text-sm text-muted-foreground">No plans are listed here yet. Check back soon.</p>;
	}

	const bestId = getBestValueId(plans);
	const visible = limit ? plans.slice(0, limit) : plans;

	return (
		<div className="space-y-6">
			<div className="grid gap-5 pt-3 sm:grid-cols-2 lg:grid-cols-3">
				{visible.map((plan) => (
					<PricingCard
						key={plan.id}
						plan={plan}
						featured={plan.id === bestId}
						cta={
							kind === "pppoe" ? (
								<Button asChild size="lg" className="w-full">
									<Link href="/register">Get started</Link>
								</Button>
							) : undefined
						}
					/>
				))}
			</div>

			{kind === "hotspot" && (
				<Notice
					tone="info"
					title="Hotspot plans are bought on the wifi page"
					text="Connect to a WifiSpace hotspot and the plan page opens automatically. Pick your plan, pay, and you're online. No account needed."
				/>
			)}
		</div>
	);
}

interface PricingTabsProps {
	home: Plan[] | null;
	hotspot: Plan[] | null;
	defaultTab?: Kind;
	limit?: number;
}

export function PricingTabs({ home, hotspot, defaultTab = "pppoe", limit }: PricingTabsProps) {
	return (
		<Tabs defaultValue={defaultTab} className="gap-6">
			<TabsList className="mx-auto">
				<TabsTrigger value="pppoe">Home &amp; office</TabsTrigger>
				<TabsTrigger value="hotspot">Wifi hotspot</TabsTrigger>
			</TabsList>
			<TabsContent value="pppoe">
				<PlanList plans={home} kind="pppoe" limit={limit} />
			</TabsContent>
			<TabsContent value="hotspot">
				<PlanList plans={hotspot} kind="hotspot" limit={limit} />
			</TabsContent>
		</Tabs>
	);
}
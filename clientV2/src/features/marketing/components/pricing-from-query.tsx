"use client";

import { useSearchParams } from "next/navigation";
import type { Plan } from "@/features/plans/types/plans.types";
import { PricingTabs } from "./pricing-tabs";

export function PricingFromQuery({ home, hotspot }: { home: Plan[] | null; hotspot: Plan[] | null }) {
	const type = useSearchParams().get("type");
	return <PricingTabs home={home} hotspot={hotspot} defaultTab={type === "hotspot" ? "hotspot" : "pppoe"} />;
}	
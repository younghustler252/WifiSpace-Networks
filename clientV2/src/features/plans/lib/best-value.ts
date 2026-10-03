import { durationInDays } from "@/lib/format";
import type { Plan } from "../types/plans.types";
import { getPlanPricing } from "./pricing";

export function getBestValueId(plans: Plan[]) {
	if (plans.length < 2) return null;
	const perDay = plans.map((p) => ({
		id: p.id,
		value: getPlanPricing(p).final / durationInDays(p.durationValue, p.durationUnit),
	}));
	return perDay.reduce((best, cur) => (cur.value < best.value ? cur : best)).id;
}
import { durationInDays } from "@/lib/format";
import type { Plan } from "../types/plans.types";

export function getBestValueId(plans: Plan[]) {
	if (plans.length < 2) return null;
	const perDay = plans.map((p) => ({ id: p.id, value: p.price / durationInDays(p.durationValue, p.durationUnit) }));
	return perDay.reduce((best, cur) => (cur.value < best.value ? cur : best)).id;
}
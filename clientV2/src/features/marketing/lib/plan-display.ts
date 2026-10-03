import type { Plan } from "@/features/plans/types/plans.types";
import { formatDuration } from "@/lib/format";

const singular = (unit: string) => unit.toLowerCase().replace(/s$/, "");

export function formatPlanPeriod(plan: Plan) {
	return plan.durationValue === 1
		? `/ ${singular(plan.durationUnit)}`
		: `for ${formatDuration(plan.durationValue, plan.durationUnit)}`;
}
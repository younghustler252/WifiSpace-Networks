import { formatCurrency } from "@/lib/format";
import type { Plan } from "../types/plans.types";

export interface PlanPricing {
	base: number;
	final: number;
	hasDiscount: boolean;
	label?: string;
	validUntil?: string | null;
}

export function getPlanPricing(plan: Plan, now = Date.now()): PlanPricing {
	const base = plan.price;
	const value = plan.discountValue ?? 0;
	const expired = plan.discountValidUntil ? new Date(plan.discountValidUntil).getTime() < now : false;

	if (!plan.discountType || value <= 0 || expired) return { base, final: base, hasDiscount: false };

	const raw = plan.discountType === "percentage" ? base * (1 - Math.min(value, 100) / 100) : base - value;
	const final = Math.max(0, Math.round(raw));
	if (final >= base) return { base, final: base, hasDiscount: false };

	return {
		base,
		final,
		hasDiscount: true,
		label: plan.discountType === "percentage" ? `${value}% off` : `${formatCurrency(base - final)} off`,
		validUntil: plan.discountValidUntil ?? null,
	};
}
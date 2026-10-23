import { Check, Gauge, Smartphone } from "lucide-react";
import { getPlanPricing } from "@/features/plans/lib/pricing";
import type { Plan } from "@/features/plans/types/plans.types";
import { formatCurrency, formatDataLimit, formatDuration } from "@/lib/format";
import { cn } from "@/lib/utils";

interface PortalPlanCardProps {
	plan: Plan;
	selected: boolean;
	highlight?: string;
	onSelect: (plan: Plan) => void;
}

export function PortalPlanCard({ plan, selected, highlight, onSelect }: PortalPlanCardProps) {
	const pricing = getPlanPricing(plan);

	return (
		<button
			type="button"
			role="radio"
			aria-checked={selected}
			onClick={() => onSelect(plan)}
			className={cn(
				"relative flex min-h-20 w-full items-center gap-3 rounded-2xl border bg-card p-4 text-left transition-all active:scale-[0.99]",
				"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
				selected ? "border-primary bg-accent/40 ring-1 ring-primary" : "hover:border-primary/50"
			)}
		>
			{highlight && (
				<span className="absolute -top-2.5 left-4 rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-medium text-primary-foreground">{highlight}</span>
			)}

			<span
				className={cn(
					"flex size-6 shrink-0 items-center justify-center rounded-full border",
					selected ? "border-primary bg-primary text-primary-foreground" : "border-border"
				)}
			>
				{selected && <Check className="size-3.5" strokeWidth={3} />}
			</span>

			<div className="min-w-0 flex-1">
				<p className="truncate text-base font-semibold">{formatDuration(plan.durationValue, plan.durationUnit)}</p>
				<p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[12px] text-muted-foreground">
					<span className="inline-flex items-center gap-1">
						<Gauge className="size-3.5" />
						{plan.speedRate}
					</span>
					<span>{formatDataLimit(plan.dataLimitBytes)}</span>
					<span className="inline-flex items-center gap-1">
						<Smartphone className="size-3.5" />
						{plan.devicesAllowed}
					</span>
				</p>
			</div>

			<div className="shrink-0 text-right">
				<p className="text-mono text-xl font-semibold">{formatCurrency(pricing.final)}</p>
				{pricing.hasDiscount && (
					<>
						<p className="text-mono text-[12px] text-muted-foreground line-through">{formatCurrency(pricing.base)}</p>
						<p className="text-[11px] font-medium text-success">{pricing.label}</p>
					</>
				)}
			</div>
		</button>
	);
}

import { Check, Gauge, Smartphone } from "lucide-react";
import { formatCurrency, formatDataLimit, formatDuration } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Plan } from "../types/plans.types";

interface PlanCardProps {
	plan: Plan;
	selected: boolean;
	highlight?: string;
	onSelect: (plan: Plan) => void;
}

export function PlanCard({ plan, selected, highlight, onSelect }: PlanCardProps) {
	return (
		<button
			type="button"
			role="radio"
			aria-checked={selected}
			onClick={() => onSelect(plan)}
			className={cn(
				"relative w-full rounded-2xl border bg-card p-4 text-left transition-all active:scale-[0.99]",
				"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
				selected ? "border-primary bg-accent/40 ring-1 ring-primary" : "hover:border-primary/50"
			)}
		>
			{highlight && (
				<span className="absolute -top-2.5 right-4 rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-medium text-primary-foreground">
					{highlight}
				</span>
			)}

			<div className="flex items-start justify-between gap-4">
				<div className="space-y-1">
					<p className="text-sm text-muted-foreground">{plan.name}</p>
					<p className="text-mono text-2xl font-semibold">{formatCurrency(plan.price)}</p>
					<p className="text-sm font-medium">{formatDuration(plan.durationValue, plan.durationUnit)}</p>
				</div>
				<span
					className={cn(
						"mt-1 flex size-6 shrink-0 items-center justify-center rounded-full border",
						selected ? "border-primary bg-primary text-primary-foreground" : "border-border"
					)}
				>
					{selected && <Check className="size-3.5" strokeWidth={3} />}
				</span>
			</div>

			<div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
				<span className="inline-flex items-center gap-1">
					<Gauge className="size-3.5" />
					{plan.speedRate}
				</span>
				<span>{formatDataLimit(plan.dataLimitBytes)}</span>
				<span className="inline-flex items-center gap-1">
					<Smartphone className="size-3.5" />
					{plan.devicesAllowed} {plan.devicesAllowed === 1 ? "device" : "devices"}
				</span>
			</div>
		</button>
	);
}
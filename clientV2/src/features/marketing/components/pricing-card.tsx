import { Check, Database, Gauge, Smartphone, type LucideIcon } from "lucide-react";
import type { Plan } from "@/features/plans/types/plans.types";
import { getPlanPricing } from "@/features/plans/lib/pricing";
import { formatCurrency, formatDataLimit, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { formatPlanPeriod } from "../lib/plan-display";

function Spec({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
	return (
		<li className="flex items-center gap-2.5">
			<Icon className="size-4 shrink-0 text-signal" />
			{children}
		</li>
	);
}

interface PricingCardProps {
	plan: Plan;
	featured?: boolean;
	cta?: React.ReactNode;
}

export function PricingCard({ plan, featured, cta }: PricingCardProps) {
	const pricing = getPlanPricing(plan);

	return (
		<article className={cn("card-elevated relative flex flex-col p-5", featured && "border-primary ring-1 ring-primary")}>
			{featured && (
				<span className="absolute -top-2.5 left-5 rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-medium text-primary-foreground">
					Best value
				</span>
			)}

			<h3 className="text-sm font-medium text-muted-foreground">{plan.name}</h3>
			<div className="mt-2 flex flex-wrap items-baseline gap-x-2">
				<span className="text-mono text-3xl font-semibold">{formatCurrency(pricing.final)}</span>
				<span className="text-sm text-muted-foreground">{formatPlanPeriod(plan)}</span>
			</div>

			{pricing.hasDiscount && (
				<p className="mt-1.5 flex flex-wrap items-center gap-2 text-[12px]">
					<span className="text-mono text-muted-foreground line-through">{formatCurrency(pricing.base)}</span>
					<span className="rounded-full bg-success-soft px-2 py-0.5 font-medium text-success">{pricing.label}</span>
					{pricing.validUntil && <span className="text-muted-foreground">Ends {formatDate(pricing.validUntil)}</span>}
				</p>
			)}

			<ul className="mt-5 space-y-2.5 text-[13px]">
				<Spec icon={Gauge}>{plan.speedRate} speed</Spec>
				<Spec icon={Database}>{formatDataLimit(plan.dataLimitBytes)}</Spec>
				<Spec icon={Smartphone}>
					Up to {plan.devicesAllowed} device{plan.devicesAllowed === 1 ? "" : "s"}
				</Spec>
				{(plan.features ?? []).map((feature) => (
					<li key={feature} className="flex items-center gap-2.5 text-muted-foreground">
						<Check className="size-4 shrink-0 text-success" />
						{feature}
					</li>
				))}
			</ul>

			{cta && <div className="mt-auto pt-6">{cta}</div>}
		</article>
	);
}
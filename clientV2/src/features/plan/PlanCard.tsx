"use client";

import Card, { CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Zap, Clock, Smartphone } from "lucide-react";

interface PlanCardProps {
	plan: any;
	onSelect: (plan: any) => void;
	isCurrent?: boolean;
	disabled?: boolean;
}

export default function PlanCard({
	plan,
	onSelect,
	isCurrent = false,
	disabled = false,
}: PlanCardProps) {
	// Only disable interactions if explicitly instructed by the parent component context
	const isBlocked = disabled;

	const getDurationLabel = () =>
		`${plan.durationValue} ${plan.durationUnit}`;

	return (
		<Card
			onClick={() => {
				if (!isBlocked) onSelect(plan);
			}}
			className={`h-full border-2 transition-all relative cursor-pointer hover:border-accent ${
				isCurrent ? "border-accent shadow-sm" : ""
			} ${isBlocked ? "opacity-60 cursor-not-allowed pointer-events-none" : ""}`}
		>
			<CardContent>
				<div className="flex flex-col h-full ui-stack">

					{/* Active Subscription Indicator Badge */}
					{isCurrent && (
						<div className="absolute top-0 right-0 bg-accent text-white text-xs px-3 py-1 rounded-bl-xl font-medium tracking-wide">
							Current Plan
						</div>
					)}

					{/* Plan Tier Header */}
					<div className="flex items-center justify-between">
						<h3 className="text-lg font-semibold">{plan.name}</h3>
						<span className="ui-badge ui-badge-success capitalize">
							{plan.serviceType}
						</span>
					</div>

					{/* Price Matrix Notation */}
					<div className="text-3xl font-bold">
						₦{plan.price.toLocaleString()}
						<span className="text-sm text-muted-foreground font-normal">
							/{getDurationLabel()}
						</span>
					</div>

					{/* Core Node Parameters */}
					<div className="ui-stack text-sm text-muted-foreground">
						<div className="flex items-center gap-2">
							<Zap size={14} />
							{plan.speedRate}
						</div>

						<div className="flex items-center gap-2">
							<Smartphone size={14} />
							{plan.devicesAllowed} device(s)
						</div>

						<div className="flex items-center gap-2">
							<Clock size={14} />
							{getDurationLabel()} validity
						</div>

						{plan.accountType && (
							<div className="text-xs uppercase opacity-70">
								{plan.accountType} plan
							</div>
						)}
					</div>

					{/* Secondary Feature Sets */}
					<div className="flex-1">
						{plan.features?.length > 0 && (
							<ul className="text-sm text-muted-foreground space-y-1">
								{plan.features.map((f: string, i: number) => (
									<li key={i}>• {f}</li>
								))}
							</ul>
						)}
					</div>

					{/* Click Execution Action Layer */}
					<div className="pt-4">
						<Button
							variant={isCurrent ? "outline" : "accent"}
							fullWidth
							disabled={isBlocked}
							onClick={(e) => {
								e.stopPropagation();
								if (!isBlocked) onSelect(plan);
							}}
						>
							{isCurrent
								? "Renew / Manage Plan"
								: isBlocked
								? "Not Available"
								: "Select Plan"}
						</Button>
					</div>

				</div>
			</CardContent>
		</Card>
	);
}

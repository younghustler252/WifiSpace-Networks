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
	// Treat both as blocking conditions
	const isBlocked = isCurrent || disabled;

	// Format duration properly
	const getDurationLabel = () =>
		`${plan.durationValue} ${plan.durationUnit}`;

	return (
		<Card
			onClick={() => {
				if (!isBlocked) onSelect(plan);
			}}
			className={`h-full border-2 transition-all relative cursor-pointer hover:border-accent ${
				isBlocked ? "opacity-80 cursor-not-allowed" : ""
			}`}
		>
			<CardContent>
				<div className="flex flex-col h-full ui-stack">

					{/* CURRENT PLAN BADGE */}
					{isCurrent && (
						<div className="absolute top-0 right-0 bg-accent text-white text-xs px-3 py-1 rounded-bl-xl">
							current plan
						</div>
					)}

					{/* TOP SECTION */}
					<div className="flex items-center justify-between">
						<h3 className="text-lg font-semibold">{plan.name}</h3>
						<span className="ui-badge ui-badge-success capitalize">
							{plan.serviceType}
						</span>
					</div>

					{/* PRICE */}
					<div className="text-3xl font-bold">
						₦{plan.price.toLocaleString()}
						<span className="text-sm text-muted-foreground font-normal">
							/{getDurationLabel()}
						</span>
					</div>

					{/* DETAILS */}
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

					{/* FEATURES */}
					<div className="flex-1">
						{plan.features?.length > 0 && (
							<ul className="text-sm text-muted-foreground space-y-1">
								{plan.features.map((f: string, i: number) => (
									<li key={i}>• {f}</li>
								))}
							</ul>
						)}
					</div>

					{/* ACTION */}
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
								? "Current Plan"
								: disabled
								? "Not Available"
								: "Select Plan"}
						</Button>
					</div>

				</div>
			</CardContent>
		</Card>
	);
}
"use client";

import Card, { CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Zap, Clock, Smartphone } from "lucide-react";

export default function PlanCard({
	plan,
	onSelect,
}: {
	plan: any;
	onSelect: (plan: any) => void;
}) {
	// Format duration properly
	const getDurationLabel = () => {
		return `${plan.durationValue} ${plan.durationUnit}`;
	};

	return (
		<Card
			onClick={() => onSelect(plan)}
			className="h-full border-2 hover:border-accent transition-all relative cursor-pointer"
		>
			<CardContent>
				<div className="flex flex-col h-full ui-stack">

					{/* POPULAR BADGE */}
					{plan.price >= 20000 && (
						<div className="absolute top-0 right-0 bg-accent text-white text-xs px-3 py-1 rounded-bl-xl">
							Popular
						</div>
					)}

					{/* TOP SECTION */}
					<div className="flex items-center justify-between">
						<h3 className="text-lg font-semibold">
							{plan.name}
						</h3>

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
							variant="accent"
							fullWidth
							onClick={(e) => {
								e.stopPropagation();
								onSelect(plan);
							}}
						>
							Select Plan
						</Button>
					</div>

				</div>
			</CardContent>
		</Card>
	);
}
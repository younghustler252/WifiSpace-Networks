"use client";

import { Clock3 } from "lucide-react";

import Card, { CardContent, CardHeader } from "@/components/ui/Card";

interface Props {
	progress: number;
	daysLeft: number;
	isExpired: boolean;
	startDate: string;
	endDate: string;
}

/* ====================================================== */

export default function SubscriptionTimeline({
	progress,
	daysLeft,
	isExpired,
	startDate,
	endDate,
}: Props) {
	const safeProgress = Math.min(100, Math.max(0, progress));

	return (
		<Card>

			<CardHeader>
				<h3 className="font-semibold">
					Subscription Timeline
				</h3>
			</CardHeader>

			<CardContent className="space-y-5">

				{/* PROGRESS HEADER */}
				<div className="flex justify-between text-sm">
					<span>Usage Progress</span>
					<span>{Math.round(safeProgress)}%</span>
				</div>

				{/* PROGRESS BAR */}
				<div className="h-2 rounded-full bg-muted overflow-hidden">

					<div
						className={`h-full transition-all ${
							isExpired ? "bg-danger" : "bg-accent"
						}`}
						style={{ width: `${safeProgress}%` }}
					/>
				</div>

				{/* DATES */}
				<div className="flex justify-between text-xs text-muted-foreground">
					<span>Started {startDate}</span>
					<span>Expires {endDate}</span>
				</div>

				{/* DAYS LEFT */}
				<div className="pt-3 flex items-center justify-between">

					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<Clock3 size={16} />
						{daysLeft === 0 ? "Expired" : "Days Remaining"}
					</div>

					<div className="text-2xl font-bold">
						{daysLeft}
					</div>

				</div>

			</CardContent>

		</Card>
	);
}
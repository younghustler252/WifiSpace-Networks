"use client";

import { Clock3, CalendarDays, ShieldAlert } from "lucide-react";
import Card, { CardContent, CardHeader } from "@/components/ui/Card";

interface Props {
	progress: number;
	daysLeft: number;
	isExpired: boolean;
	startDate: string;
	endDate: string;
	graceEndsAt?: string | Date; // Added profile attribute to match your schema
}

export default function SubscriptionTimeline({
	progress,
	daysLeft,
	isExpired,
	startDate,
	endDate,
	graceEndsAt,
}: Props) {
	const safeProgress = Math.min(100, Math.max(0, progress));
	
	// Format utility to keep timeline string dates uniform
	const formatTimelineDate = (rawStr: string) => {
		if (!rawStr) return "N/A";
		try {
			return new Date(rawStr).toLocaleDateString(undefined, { 
				month: 'short', 
				day: 'numeric', 
				year: 'numeric' 
			});
		} catch {
			return rawStr;
		}
	};

	// Determine high density color accent dynamically based on remaining timeframe
	const getProgressBarColor = () => {
		if (isExpired) return "bg-danger";
		if (daysLeft <= 3) return "bg-warning"; // Visual warning state cue
		return "bg-accent";
	};

	return (
		<Card>
			<CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
				<div className="flex items-center gap-2">
					<CalendarDays className="h-5 w-5 text-muted-foreground" />
					<h3 className="font-semibold text-lg">Subscription Timeline</h3>
				</div>
				{isExpired && (
					<span className="text-xs font-bold uppercase tracking-wider text-danger bg-danger/10 px-2 py-0.5 rounded-md">
						Term Ended
					</span>
				)}
			</CardHeader>

			<CardContent className="space-y-5">
				{/* PROGRESS TRACKER TEXT */}
				<div className="flex justify-between text-sm font-medium">
					<span className="text-muted-foreground">Usage Cycle Progress</span>
					<span className="text-foreground font-semibold">{Math.round(safeProgress)}%</span>
				</div>

				{/* ANIMATED BAR LAYOUT CONTAINER */}
				<div className="h-2.5 rounded-full bg-muted/60 overflow-hidden border border-muted">
					<div
						className={`h-full transition-all duration-500 ${getProgressBarColor()}`}
						style={{ width: `${safeProgress}%` }}
					/>
				</div>

				{/* DATES MATRIX TRACK */}
				<div className="grid grid-cols-2 text-xs border-b border-border/50 pb-4 text-muted-foreground">
					<div>
						<span className="block text-[10px] uppercase font-bold tracking-wider text-muted-foreground/70">Activated On</span>
						<span className="text-sm font-semibold text-foreground mt-0.5 block">{formatTimelineDate(startDate)}</span>
					</div>
					<div className="text-right">
						<span className="block text-[10px] uppercase font-bold tracking-wider text-muted-foreground/70">Expiration Target</span>
						<span className={`text-sm font-semibold mt-0.5 block ${isExpired ? 'text-danger' : 'text-foreground'}`}>
							{formatTimelineDate(endDate)}
						</span>
					</div>
				</div>

				{/* SUBSECTION METRICS FOR DAYS OVERVIEW */}
				<div className="flex items-center justify-between pt-1">
					<div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
						<Clock3 className="h-4 w-4 text-muted-foreground/80" />
						<span>{isExpired ? "Account Status:" : "Time Left in Cycle:"}</span>
					</div>

					<div className="flex items-baseline gap-1">
						<span className={`text-3xl font-black tracking-tight ${isExpired ? 'text-danger' : 'text-foreground'}`}>
							{daysLeft}
						</span>
						<span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
							{daysLeft === 1 ? "Day" : "Days"}
						</span>
					</div>
				</div>

				{/* DYNAMIC GRACE EXTRA SECURITY ALERT ELEMENT */}
				{!isExpired && graceEndsAt && new Date(graceEndsAt) > new Date() && (
					<div className="mt-4 flex gap-2.5 items-start bg-amber-50 border border-amber-200/60 p-3 rounded-xl dark:bg-amber-950/20 dark:border-amber-900/30">
						<ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
						<div className="text-xs">
							<p className="font-semibold text-amber-800 dark:text-amber-300">Grace Extension Parameter Active</p>
							<p className="text-amber-700/90 dark:text-amber-400/80 mt-0.5">
								Router routing bandwidth drops on <strong className="font-bold">{formatTimelineDate(graceEndsAt.toString())}</strong> if manual funding invoice remains unverified.
							</p>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

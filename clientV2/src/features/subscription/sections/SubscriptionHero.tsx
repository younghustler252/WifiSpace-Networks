"use client";

import { Wifi } from "lucide-react";

import { Subscription } from "../subscription.types";

import Card, {
	CardContent,
	CardHeader,
} from "@/components/ui/Card";
import StatusBadge from "@/components/ui/StatusBadge";

/* ====================================================== */

type Status =
	| "active"
	| "suspended"
	| "expired"
	| "canceled"
	| string;

interface Props {
	subscription: Subscription;
	status: Status;
}

const statusVariantMap: Record<string, any> = {
	active: "success",
	suspended: "warning",
	expired: "danger",
	canceled: "default",
};

/* ====================================================== */

export default function SubscriptionHero({
	subscription,
	status,
}: Props) {
	const plan = subscription.planSnapshot;

	return (
		<Card>
			<CardHeader>
				<div className="flex items-start gap-4">
					{/* PLAN ICON */}
					<div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent/10 text-accent">
						<Wifi className="h-7 w-7" />
					</div>

					{/* PLAN DETAILS */}
					<div className="min-w-0 flex-1">
						<div className="flex flex-wrap items-center gap-3">
							<h1 className="text-2xl font-semibold">
								{plan?.name ?? "Unknown Plan"}
							</h1>

							<StatusBadge
								variant={
									statusVariantMap[status] ?? "info"
								}
								withDot
							>
								{status}
							</StatusBadge>
						</div>

						<p className="mt-2 text-sm text-muted-foreground">
							{plan?.serviceType ?? "Unknown Service"}

							{plan?.speedRate && (
								<>
									<span className="mx-2">•</span>
									<span>{plan.speedRate}</span>
								</>
							)}
						</p>
					</div>
				</div>
			</CardHeader>
		</Card>
	);
}
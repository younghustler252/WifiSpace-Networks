"use client";
import { WifiOff, PlusCircle } from "lucide-react";
import Link from "next/link";
import { useSubscription } from "@/features/subscription/hooks/useSubscription";

import {
	CalendarDays,
	CreditCard,
	ArrowRight,
	Wifi,
} from "lucide-react";

import Card, {
	CardContent,
	CardHeader,
} from "@/components/ui/Card";
import Button from "@/components/ui/Button";

type Props = {
	accountId: string;
	role?: "customer" | "superAdmin" | "staff";
};

export default function SubscriptionSummary({
	accountId,
	role = "customer",
}: Props) {

	const {
		subscription,
		isLoading,
		error,
	} = useSubscription(accountId);

	if (isLoading) {
		return (
			<Card>
				<CardContent className="p-4 text-sm">
					Loading subscription...
				</CardContent>
			</Card>
		);
	}

	
if (error || !subscription) {
	return (
		<Card>
			<CardContent className="p-6">
				<div className="flex flex-col items-center text-center">
					
					<div className="
						h-14 w-14
						rounded-2xl
						bg-muted
						flex items-center justify-center
						mb-4
					">
						<WifiOff
							size={26}
							className="text-muted-foreground"
						/>
					</div>

					<h3 className="font-semibold text-base">
						No Subscription Assigned
					</h3>

					<p className="
						text-sm text-muted-foreground
						mt-2 max-w-sm
					">
						This account does not currently have an
						active subscription plan.
					</p>

					{role !== "customer" ? (
						<Link
							href={`/admin/subscriptions/create?accountId=${accountId}`}
							className="mt-5"
						>
							<Button className="gap-2">
								<PlusCircle size={16} />
								Assign Subscription
							</Button>
						</Link>
					) : (
						<Link
							href="/plans"
							className="mt-5"
						>
							<Button>
								View Available Plans
							</Button>
						</Link>
					)}
				</div>
			</CardContent>
		</Card>
	);
}

	const plan = subscription.planSnapshot;

	const statusColor =
		subscription.status === "active"
			? "bg-emerald-100 text-emerald-700"
			: subscription.status === "suspended"
			? "bg-amber-100 text-amber-700"
			: "bg-red-100 text-red-700";

	return (
		<Card>
			<CardHeader className="
				flex items-center justify-between
				p-4
			">

				<div>
					<h3 className="font-semibold text-sm">
						Subscription
					</h3>

					<p className="text-xs text-muted-foreground">
						Current plan status
					</p>
				</div>

				<Link
					href={
						role === "customer"
							? "/subscription"
							: `/admin/subscriptions/${subscription?.accountId}`
					}
				>
					<Button
						variant="outline"
						size="sm"
						className="gap-1 text-xs h-8"
					>
						View
						<ArrowRight size={12} />
					</Button>
				</Link>

			</CardHeader>

			<CardContent className="space-y-3 p-4 pt-0">

				{/* PLAN + STATUS */}
				<div className="
					flex items-center justify-between
					p-3 rounded-xl border border-border
				">

					<div className="min-w-0">

						<p className="font-semibold text-sm truncate">
							{plan?.name}
						</p>

						<div className="flex items-center gap-2 text-xs text-muted-foreground">
							<Wifi size={12} />
							{plan?.speedRate}
							<span>•</span>
							{plan?.durationValue}
							{plan?.durationUnit}
						</div>

					</div>

					<span className={`
						text-[10px]
						px-2 py-1
						rounded-full
						whitespace-nowrap
						${statusColor}
					`}>
						{subscription.status}
					</span>

				</div>

				{/* STATS ROW */}
				<div className="grid grid-cols-2 gap-2">

					<div className="
						p-3 rounded-xl border border-border
					">

						<div className="
							text-xs text-muted-foreground
							flex items-center gap-1
						">
							<CreditCard size={12} />
							Last Payment
						</div>

						<p className="text-sm font-semibold mt-1">
							₦{subscription.lastPaymentAmount?.toLocaleString()}
						</p>

					</div>

					<div className="
						p-3 rounded-xl border border-border
					">

						<div className="
							text-xs text-muted-foreground
							flex items-center gap-1
						">
							<CalendarDays size={12} />
							Expires
						</div>

						<p className="text-sm font-semibold mt-1">
							{new Date(
								subscription.expiresAt
							).toLocaleDateString()}
						</p>

					</div>

				</div>

				{/* SMALL META */}
				<div className="
					text-[11px]
					text-muted-foreground
					flex justify-between
				">

					<span>
						Cycles: {subscription.cycles}
					</span>

					<span>
						Renewal: {subscription.renewalStrategy}
					</span>

				</div>

			</CardContent>
		</Card>
	);
}
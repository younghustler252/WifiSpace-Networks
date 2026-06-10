"use client";

import {
	Activity,
	Crown,
	Plus,
	RefreshCcw,
	Router,
	Wifi,
	Zap,
} from "lucide-react";

import { Subscription } from "@/lib/api/subscription";

import Card, {
	CardContent,
	CardHeader,
} from "@/components/ui/Card";

import Button from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";

import SubscriptionStat from "../components/SubscriptionStat";

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

	canRenew: boolean;
	canManage: boolean;

	onRenew: () => void;
	onUpgrade?: () => void;
	onAssign?: () => void;

	renewing?: boolean;
}

/* ====================================================== */

const statusVariantMap: Record<string, any> = {
	active: "success",
	suspended: "warning",
	expired: "danger",
	canceled: "default",
};

export default function SubscriptionHero({
	subscription,
	status,
	canRenew,
	canManage,
	onRenew,
	onUpgrade,
	onAssign,
	renewing,
}: Props) {
	return (
		<Card className="overflow-hidden">

			<CardHeader>
				<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

					{/* LEFT INFO */}
					<div className="flex items-start gap-4">

						<div className="w-14 h-14 rounded-3xl bg-accent/10 flex items-center justify-center text-accent shrink-0">
							<Wifi />
						</div>

						<div>

							<div className="flex items-center gap-2 flex-wrap">

								<h2 className="text-2xl font-semibold">
									{subscription.planSnapshot?.name}
								</h2>

								<StatusBadge
									variant={
										statusVariantMap[status] ?? "info"
									}
									withDot
								>
									{status}
								</StatusBadge>

							</div>

							<p className="text-muted-foreground text-sm mt-2">
								{subscription.planSnapshot?.serviceType} •{" "}
								{subscription.planSnapshot?.speedRate}
							</p>

						</div>

					</div>

					{/* ACTIONS */}
					<div className="flex flex-wrap gap-3">

						{canRenew && (
							<>
								<Button
									variant="accent"
									leftIcon={<RefreshCcw size={16} />}
									isLoading={renewing}
									onClick={onRenew}
								>
									Renew
								</Button>

								<Button
									variant="outline"
									leftIcon={<Crown size={16} />}
									onClick={onUpgrade}
								>
									Upgrade
								</Button>
							</>
						)}

						{canManage && (
							<>
								<Button
									variant="outline"
									leftIcon={<Plus size={16} />}
									onClick={onAssign}
								>
									Assign Plan
								</Button>

								<Button
									variant="accent"
									leftIcon={<RefreshCcw size={16} />}
									isLoading={renewing}
									onClick={onRenew}
								>
									Renew
								</Button>

								<Button
									variant="soft"
									leftIcon={<Crown size={16} />}
									onClick={onUpgrade}
								>
									Upgrade
								</Button>
							</>
						)}

					</div>

				</div>
			</CardHeader>

			<CardContent>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">

					<SubscriptionStat
						label="Speed"
						value={subscription.planSnapshot?.speedRate || "N/A"}
						icon={<Zap />}
					/>

					<SubscriptionStat
						label="Devices"
						value={subscription.planSnapshot?.devicesAllowed || 1}
						icon={<Router />}
					/>

					<SubscriptionStat
						label="Total Amount"
						value={`₦${subscription.totalAmount?.toLocaleString()}`}
						icon={<Activity />}
					/>

				</div>
			</CardContent>

		</Card>
	);
}
"use client";

import { AlertTriangle } from "lucide-react";

import { Subscription } from "../subscription.types";
import Card, { CardContent, CardHeader } from "@/components/ui/Card";

import SubscriptionInfo from "../components/SubscriptionInfo";

interface Props {
	subscription: Subscription;
}

/* ====================================================== */

export default function SubscriptionOverview({
	subscription,
}: Props) {
	return (
		<div className="grid md:grid-cols-2 gap-6">

			{/* ======================================================
			    PLAN DETAILS
			====================================================== */}

			<Card>

				<CardHeader>
					<h3 className="font-semibold">
						Plan Details
					</h3>
				</CardHeader>

				<CardContent className="space-y-4">

					<SubscriptionInfo
						label="Service Type"
						value={subscription.planSnapshot?.serviceType}
					/>

					<SubscriptionInfo
						label="Duration"
						value={`${subscription.planId?.durationValue} ${subscription.planId?.durationUnit}`}
					/>

					<SubscriptionInfo
						label="Price"
						value={`₦${subscription.planSnapshot?.price?.toLocaleString()}`}
					/>

					<SubscriptionInfo
						label="Cycles"
						value={subscription.cycles}
					/>

					<SubscriptionInfo
						label="Auto Renew"
						value={
							subscription.autoRenewEnabled
								? "Enabled"
								: "Disabled"
						}
					/>

					<SubscriptionInfo
						label="Renewal Strategy"
						value={subscription.renewalStrategy}
					/>

					<SubscriptionInfo
						label="Grace Period"
						value={`${subscription.planSnapshot?.gracePeriodDays} days`}
					/>

				</CardContent>

			</Card>

			{/* ======================================================
			    HEALTH
			====================================================== */}

			<Card>

				<CardHeader>
					<h3 className="font-semibold">
						Subscription Health
					</h3>
				</CardHeader>

				<CardContent className="space-y-4">

					<SubscriptionInfo
						label="MikroTik Sync"
						value={subscription.mikrotikStatus}
					/>

					{subscription.lastRenewedAt && (
						<SubscriptionInfo
							label="Last Renewed"
							value={new Date(subscription.lastRenewedAt).toLocaleDateString()}
						/>
					)}

					{subscription.nextRenewalDate && (
						<SubscriptionInfo
							label="Next Renewal"
							value={new Date(subscription.nextRenewalDate).toLocaleDateString()}
						/>
					)}

					{subscription.suspendedAt && (
						<SubscriptionInfo
							label="Suspended At"
							value={new Date(subscription.suspendedAt).toLocaleDateString()}
						/>
					)}

					{subscription.suspensionReason && (
						<SubscriptionInfo
							label="Suspension Reason"
							value={subscription.suspensionReason}
						/>
					)}

					{subscription.mikrotikError && (
						<div className="rounded-2xl bg-danger/10 border border-danger/20 p-4">

							<div className="flex gap-2 items-start">

								<AlertTriangle
									size={18}
									className="text-danger mt-0.5"
								/>

								<div>

									<p className="font-medium text-danger">
										MikroTik Sync Error
									</p>

									<p className="text-sm text-muted-foreground mt-1">
										{subscription.mikrotikError}
									</p>

								</div>

							</div>

						</div>
					)}

				</CardContent>

			</Card>

		</div>
	);
}
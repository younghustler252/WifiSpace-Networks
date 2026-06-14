"use client";

import React, { useState } from "react";
import {
	Wifi,
	Download,
	Upload,
	Clock,
	CalendarDays,
	RefreshCw,
	Zap,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";

import { useSubscription } from "@/features/subscription/hooks/useSubscription";
import { useSubscriptionMetrics } from "@/features/subscription/hooks/useSubscriptionMetrics";
import SubscriptionRing from "@/components/ui/SubscriptionRing";

import { useUsage } from "@/features/usage/hooks/UseUsage";
import Card from "@/components/ui/Card";
import { CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function Dashboard() {
	const { user, activeAccount } = useAuth();

	const [openRequestModal, setOpenRequestModal] = useState(false);

	const accountId = activeAccount?.id;

	const isNoAccount = !activeAccount;

	// ================= DATA (ONLY WHEN ACCOUNT EXISTS) =================
	const { data } = useUsage(accountId);
	console.log("Usage Data:", data);
	const usage = data?.data;

	const { subscription } = useSubscription(accountId ?? "");

	const { progress = 0, daysLeft = 0 } =
		useSubscriptionMetrics(subscription);

	// ================= EMPTY STATE (NO ACCOUNT) =================
	if (isNoAccount) {
		return (
			<div className="space-y-6">
				<PageHeader
					title="Dashboard"
					subtitle={`Hello, ${user?.firstName}!`}
				/>

				<div className="p-8 border rounded-xl text-center space-y-4 bg-muted/20">
					<h2 className="text-lg font-semibold">
						No Active Account
					</h2>

					<p className="text-sm text-muted-foreground">
						You need an active account to view usage, subscription,
						and network statistics.
					</p>

					<div className="flex justify-center gap-3 pt-2">
						<Button
							variant="accent"
							onClick={() => setOpenRequestModal(true)}
						>
							Request Account
						</Button>

						<Button
							variant="outline"
							onClick={() => console.log("Explore plans")}
						>
							Explore Plans
						</Button>
					</div>
				</div>

				{/* ================= REQUEST ACCOUNT MODAL (PLACEHOLDER) ================= */}
				{openRequestModal && (
					<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
						<div className="bg-card p-6 rounded-xl w-[90%] max-w-md space-y-4">
							<h3 className="text-lg font-semibold">
								Request Account
							</h3>

							<p className="text-sm text-muted-foreground">
								This modal will later connect to the account
								request API.
							</p>

							<div className="flex justify-end gap-2 pt-2">
								<Button
									variant="outline"
									onClick={() => setOpenRequestModal(false)}
								>
									Close
								</Button>

								<Button
									variant="primary"
									onClick={() =>
										console.log("submit request")
									}
								>
									Submit Request
								</Button>
							</div>
						</div>
					</div>
				)}
			</div>
		);
	}

	// ================= NORMAL DASHBOARD =================
	return (
		<div className="space-y-6">

			<PageHeader
				title="Dashboard"
				subtitle={`Hello, ${user?.firstName}!`}
			/>

			{/* ================= USAGE ================= */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

				<StatCard
					title="Status"
					value={usage?.online ? "Online" : "Offline"}
					description={usage?.wsnId}
					icon={<Wifi />}
				/>

				<StatCard
					title="Download"
					value={
						usage
							? `${(usage.downloadBytes / 1024 / 1024).toFixed(2)} MB`
							: "0 MB"
					}
					icon={<Download />}
				/>

				<StatCard
					title="Upload"
					value={
						usage
							? `${(usage.uploadBytes / 1024 / 1024).toFixed(2)} MB`
							: "0 MB"
					}
					icon={<Upload />}
				/>

				<StatCard
					title="Uptime"
					value={usage?.uptime || "0s"}
					icon={<Clock />}
				/>

			</div>

			{/* ================= SUBSCRIPTION ================= */}
			<div className="grid gap-6 lg:grid-cols-2">

				<Card>
					<CardContent>
						<div className="flex justify-center">
							<SubscriptionRing
								progress={progress}
								daysLeft={daysLeft}
							/>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="h-full">
						<div className="flex flex-col h-full">

							<div className="mb-6">
								<h3 className="font-semibold text-lg">
									Subscription Details
								</h3>
								<p className="text-sm text-muted-foreground">
									Your active internet plan
								</p>
							</div>

							<div className="space-y-4">

								{/* PLAN */}
								<div className="flex items-center gap-4 rounded-xl border p-4">
									<div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
										<Zap size={18} />
									</div>

									<div>
										<p className="text-xs text-muted-foreground">
											Current Plan
										</p>
										<p className="font-semibold">
											{subscription?.planSnapshot?.name}
										</p>
									</div>
								</div>

								{/* EXPIRY */}
								<div className="flex items-center gap-4 rounded-xl border p-4">
									<div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
										<CalendarDays size={18} />
									</div>

									<div>
										<p className="text-xs text-muted-foreground">
											Expires On
										</p>
										<p className="font-semibold">
											{subscription?.expiresAt
												? new Date(
														subscription.expiresAt
												  ).toLocaleDateString()
												: "--"}
										</p>
									</div>
								</div>

								{/* RENEWAL */}
								<div className="flex items-center gap-4 rounded-xl border p-4">
									<div
										className={`flex size-10 items-center justify-center rounded-lg ${
											subscription?.autoRenewEnabled
												? "bg-green-500/10 text-green-500"
												: "bg-orange-500/10 text-orange-500"
										}`}
									>
										<RefreshCw size={18} />
									</div>

									<div>
										<p className="text-xs text-muted-foreground">
											Renewal
										</p>
										<p className="font-semibold">
											{subscription?.autoRenewEnabled
												? "Automatic"
												: "Manual"}
										</p>
									</div>
								</div>

							</div>
						</div>
					</CardContent>
				</Card>

			</div>
		</div>
	);
}
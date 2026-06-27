"use client";

import { Cpu, RefreshCw, AlertTriangle, CheckCircle, Radio } from "lucide-react";
import { Subscription } from "../subscription.types";
import Card, { CardContent, CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";

interface Props {
	subscription: Subscription;
	role: "customer" | "staff" | "superadmin";
	onSyncHardware?: () => void;
	isSyncing?: boolean;
}

export default function SubscriptionNetworkInfo({
	subscription,
	role,
	onSyncHardware,
	isSyncing,
}: Props) {
	const { planSnapshot, mikrotikStatus, mikrotikLastSyncAt, mikrotikError } = subscription;
	const isAdmin = role !== "customer";

	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
				<div className="flex items-center gap-2">
					<Cpu className="h-5 w-5 text-muted-foreground" />
					<h3 className="font-semibold text-lg">Network Configuration</h3>
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Public Profile Metadata */}
				<div className="grid grid-cols-2 gap-4 rounded-xl bg-muted/30 p-4 text-sm">
					<div>
						<p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Service Type</p>
						<p className="mt-1 font-semibold capitalize flex items-center gap-1.5">
							<Radio className="h-4 w-4 text-accent" />
							{planSnapshot.serviceType}
						</p>
					</div>
					<div>
						<p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Allowed Devices</p>
						<p className="mt-1 font-semibold">{planSnapshot.devicesAllowed} Node(s)</p>
					</div>
				</div>

				{/* Admin Provisioning Controls */}
				{isAdmin && (
					<div className="border border-border rounded-xl p-4 space-y-4 bg-muted/10">
						<div className="flex items-center justify-between border-b border-border pb-3">
							<div>
								<p className="text-xs text-muted-foreground font-medium">MIKROTIK PROFILE</p>
								<p className="font-mono text-sm font-semibold text-accent mt-0.5">
									{planSnapshot.mikrotikProfile || "default_profile"}
								</p>
							</div>
							<div className="text-right">
								<p className="text-xs text-muted-foreground font-medium">HARDWARE STATUS</p>
								<div className="flex items-center gap-1.5 mt-0.5">
									{mikrotikStatus === "synced" && (
										<span className="flex items-center gap-1 text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-md dark:bg-green-950/30 dark:text-green-400">
											<CheckCircle className="h-3 w-3" /> Synced
										</span>
									)}
									{mikrotikStatus === "failed" && (
										<span className="flex items-center gap-1 text-xs text-red-600 font-medium bg-red-50 px-2 py-0.5 rounded-md dark:bg-red-950/30 dark:text-red-400">
											<AlertTriangle className="h-3 w-3" /> Failed
										</span>
									)}
									{mikrotikStatus === "pending" && (
										<span className="flex items-center gap-1 text-xs text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded-md dark:bg-amber-950/30 dark:text-amber-400">
											<RefreshCw className="h-3 w-3 animate-spin" /> Pending
										</span>
									)}
								</div>
							</div>
						</div>

						{/* Operational Tracking Logs */}
						<div className="space-y-2 text-xs">
							<div className="flex justify-between">
								<span className="text-muted-foreground">Last Sync Timestamp:</span>
								<span className="font-medium text-foreground">
									{mikrotikLastSyncAt ? new Date(mikrotikLastSyncAt).toLocaleString() : "Never"}
								</span>
							</div>

							{mikrotikStatus === "failed" && mikrotikError && (
								<div className="mt-3 rounded-lg bg-red-50 p-3 border border-red-100 text-red-700 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-400">
									<p className="font-bold flex items-center gap-1 mb-1">
										<AlertTriangle className="h-3.5 w-3.5" /> Router Error Log:
									</p>
									<p className="font-mono break-words leading-relaxed">{mikrotikError}</p>
								</div>
							)}
						</div>

						{/* Action Button Integration */}
						<Button
							fullWidth
							variant={mikrotikStatus === "failed" ? "danger" : "outline"}
							size="sm"
							onClick={onSyncHardware}
							isLoading={isSyncing}
							className="mt-2"
						>
							<RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
							Force Hardware Sync
						</Button>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

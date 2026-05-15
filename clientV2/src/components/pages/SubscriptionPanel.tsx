"use client";

import { useState, useMemo } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";

import {
	subscriptionApi,
	Subscription,
} from "@/lib/api/subscription";

import Card, {
	CardHeader,
	CardContent,
} from "@/components/ui/Card";

import Button from "@/components/ui/Button";
import Modal, {
	ModalHeader,
	ModalBody,
	ModalFooter,
} from "@/components/ui/Modal";

import { CenterLoader } from "@/components/ui/Loader";

import {
	Wifi,
	PauseCircle,
	PlayCircle,
	XCircle,
	Plus,
	Zap,
	Router,
	Activity,
	AlertTriangle,
	Clock3,
} from "lucide-react";

type Role = "customer" | "staff" | "superAdmin";

interface Props {
	accountId: string;
	role: Role;
}

/* ===================================================== */

export default function SubscriptionPanel({
	accountId,
	role,
}: Props) {
	const [openAssign, setOpenAssign] = useState(false);

	// ✅ suspend modal state
	const [showSuspendModal, setShowSuspendModal] = useState(false);
	const [suspendReason, setSuspendReason] = useState("");

	/* ================= QUERY ================= */

	const { data, isLoading, error, refetch } = useQuery({
		queryKey: ["subscription", accountId],
		queryFn: () =>
			subscriptionApi.getCurrentSubscription(accountId),
		enabled: !!accountId,
	});

	const subscription: Subscription | undefined = data?.data;

	/* ================= DERIVED ================= */

	const status = subscription?.status;
	const isSuspended = status === "suspended";

	/* ================= PROGRESS ================= */

	const progress = useMemo(() => {
		if (!subscription) return 0;

		const start = new Date(subscription.startDate).getTime();
		const end = new Date(subscription.endDate).getTime();
		const now = Date.now();

		return Math.min(
			100,
			Math.max(0, ((now - start) / (end - start)) * 100)
		);
	}, [subscription]);

	const daysLeft = useMemo(() => {
		if (!subscription) return 0;

		return Math.max(
			0,
			Math.ceil(
				(new Date(subscription.endDate).getTime() -
					Date.now()) /
					(1000 * 60 * 60 * 24)
			)
		);
	}, [subscription]);

	/* ================= MUTATIONS ================= */

	const suspend = useMutation({
		mutationFn: (reason: string) =>
			subscriptionApi.suspend(subscription!.id, { reason }),
		onSuccess: () => refetch(),
	});

	const resume = useMutation({
		mutationFn: () =>
			subscriptionApi.resume(subscription!.id),
		onSuccess: () => refetch(),
	});

	const cancel = useMutation({
		mutationFn: (reason: string) =>
			subscriptionApi.cancel(subscription!.id, { reason }),
		onSuccess: () => refetch(),
	});

	const extend = useMutation({
		mutationFn: (data: { days: number; reason: string }) =>
			subscriptionApi.extend(subscription!.id, data),
		onSuccess: () => refetch(),
	});

	const forceExpire = useMutation({
		mutationFn: () =>
			subscriptionApi.forceExpire(subscription!.id),
		onSuccess: () => refetch(),
	});

	/* ================= LOADING ================= */

	if (isLoading)
		return <CenterLoader label="Loading subscription..." />;

	if (!subscription || error) {
		return (
			<Card className="text-center py-12">
				<div className="flex justify-center mb-4">
					<AlertTriangle className="text-warning" />
				</div>

				<h3 className="font-semibold text-lg">
					No Subscription Found
				</h3>

				<p className="text-muted-foreground text-sm mt-2">
					This account has no active service
				</p>

				{role !== "customer" && (
					<Button
						className="mt-6"
						variant="accent"
						leftIcon={<Plus size={16} />}
						onClick={() => setOpenAssign(true)}
					>
						Assign Subscription
					</Button>
				)}
			</Card>
		);
	}

	/* ===================================================== */

	return (
		<div className="space-y-8">

			{/* ================= HERO ================= */}
			<Card>
				<CardHeader>
					<div className="flex items-center gap-3">
						<div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
							<Wifi />
						</div>

						<div>
							<h2 className="font-semibold text-xl">
								{subscription.planSnapshot.name}
							</h2>

							<p className="text-sm text-muted-foreground">
								{status} • {subscription.billingCycle}
							</p>
						</div>
					</div>
				</CardHeader>

				<CardContent className="grid md:grid-cols-3 gap-4">
					<Stat label="Speed" value={subscription.planSnapshot.speedRate} icon={<Zap />} />
					<Stat label="Devices" value={subscription.planSnapshot.devicesAllowed ?? "∞"} icon={<Router />} />
					<Stat label="Total Paid" value={`₦${subscription.totalAmount.toLocaleString()}`} icon={<Activity />} />
				</CardContent>
			</Card>

			{/* ================= TIMELINE ================= */}
			<Card>
				<CardHeader>
					<h3 className="font-semibold">Subscription Timeline</h3>
				</CardHeader>

				<CardContent className="space-y-4">

					<div className="flex justify-between text-sm">
						<span>Progress</span>
						<span>{Math.round(progress)}%</span>
					</div>

					<div className="h-2 bg-muted rounded-full overflow-hidden">
						<div
							className="h-full bg-accent"
							style={{ width: `${progress}%` }}
						/>
					</div>

					<div className="flex justify-between text-xs text-muted-foreground">
						<span>
							Started {new Date(subscription.startDate).toLocaleDateString()}
						</span>

						<span>
							Ends {new Date(subscription.endDate).toLocaleDateString()}
						</span>
					</div>

					<div className="flex justify-between items-center mt-4">
						<div className="flex items-center gap-2">
							<Clock3 size={16} />
							<span className="text-sm text-muted-foreground">
								Days Remaining
							</span>
						</div>

						<span className="text-xl font-semibold">
							{daysLeft}
						</span>
					</div>

				</CardContent>
			</Card>

			{/* ================= PLAN + HEALTH ================= */}
			<div className="grid md:grid-cols-2 gap-6">

				{/* PLAN DETAILS */}
				<Card>
					<CardHeader>
						<h3 className="font-semibold">Plan Details</h3>
					</CardHeader>

					<CardContent className="space-y-3">
						<Info label="Billing Cycle" value={subscription.billingCycle} />
						<Info label="Base Duration" value={`${subscription.planSnapshot.durationDays} days`} />
						<Info label="Auto Renew" value={subscription.autoRenew ? "Enabled" : "Disabled"} />
						<Info label="Grace Period" value={`${subscription.gracePeriodDays} days`} />
						<Info label="Bonus Days" value={`${subscription.bonusDays} days`} />
					</CardContent>
				</Card>

				{/* HEALTH */}
				<Card>
					<CardHeader>
						<h3 className="font-semibold">Subscription Health</h3>
					</CardHeader>

					<CardContent className="space-y-3">
						<Info label="Status" value={status ?? "N/A"} />

						{subscription.lastRenewedAt && (
							<Info
								label="Last Renewed"
								value={new Date(subscription.lastRenewedAt).toLocaleDateString()}
							/>
						)}

						{subscription.nextRenewalDate && (
							<Info
								label="Next Renewal"
								value={new Date(subscription.nextRenewalDate).toLocaleDateString()}
							/>
						)}

						{subscription.suspensionReason && (
							<Info
								label="Suspension Reason"
								value={subscription.suspensionReason}
							/>
						)}
					</CardContent>
				</Card>

			</div>

			{/* ================= ACTION CENTER ================= */}
			<Card>
				<CardHeader>
					<h3 className="font-semibold">Operations Center</h3>
				</CardHeader>

				<CardContent className="flex flex-wrap gap-3">

					{role !== "customer" && !isSuspended && (
						<Button
							variant="outline"
							leftIcon={<PauseCircle size={16} />}
							onClick={() => setShowSuspendModal(true)}
						>
							Suspend
						</Button>
					)}

					{isSuspended && (
						<Button
							variant="accent"
							leftIcon={<PlayCircle size={16} />}
							onClick={() => resume.mutate()}
						>
							Resume
						</Button>
					)}

					<Button
						variant="soft"
						leftIcon={<Plus size={16} />}
						onClick={() =>
							extend.mutate({ days: 30, reason: "admin extension" })
						}
					>
						Extend 30 Days
					</Button>

					<Button
						variant="danger"
						leftIcon={<XCircle size={16} />}
						onClick={() => cancel.mutate("admin cancel")}
					>
						Cancel
					</Button>

					<Button
						variant="outline"
						leftIcon={<AlertTriangle size={16} />}
						onClick={() => forceExpire.mutate()}
					>
						Force Expire
					</Button>

				</CardContent>
			</Card>

			{/* ================= ISP OPS ================= */}
			<Card>
				<CardHeader>
					<h3 className="font-semibold">ISP Operations</h3>
				</CardHeader>

				<CardContent>
					<div className="border-t border-border pt-4">
						<p className="text-xs text-muted-foreground mb-3">
							MikroTik Integration Ready
						</p>

						<div className="flex flex-wrap gap-3">
							<Button variant="ghost">Sync MikroTik</Button>
							<Button variant="ghost">Force Disconnect</Button>
							<Button variant="ghost">Reconnect Session</Button>
							<Button variant="ghost">Reset Session</Button>
							<Button variant="ghost">Queue Profile</Button>
							<Button variant="ghost">Device Override</Button>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* ================= SUSPEND MODAL ================= */}
			<Modal open={showSuspendModal} onClose={() => setShowSuspendModal(false)}>
				<ModalHeader>Suspend Subscription</ModalHeader>

				<ModalBody>
					<textarea
						className="ui-textarea w-full"
						placeholder="Enter suspension reason..."
						value={suspendReason}
						onChange={(e) => setSuspendReason(e.target.value)}
					/>
				</ModalBody>

				<ModalFooter>
					<Button variant="ghost" onClick={() => setShowSuspendModal(false)}>
						Cancel
					</Button>

					<Button
						variant="danger"
						onClick={() => {
							suspend.mutate(suspendReason);
							setShowSuspendModal(false);
							setSuspendReason("");
						}}
					>
						Suspend
					</Button>
				</ModalFooter>
			</Modal>

		</div>
	);
}

/* ================= HELPERS ================= */

function Stat({ label, value, icon }: any) {
	return (
		<div className="ui-card flex items-center justify-between">
			<div>
				<p className="text-xs text-muted-foreground">{label}</p>
				<p className="font-semibold text-lg mt-1">{value}</p>
			</div>
			<div className="text-accent">{icon}</div>
		</div>
	);
}

function Info({ label, value }: any) {
	return (
		<div className="flex justify-between text-sm">
			<span className="text-muted-foreground">{label}</span>
			<span className="font-medium">{value}</span>
		</div>
	);
}
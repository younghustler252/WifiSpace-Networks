"use client";

import { useState } from "react";

import { useSubscription } from "./hooks/useSubscription";
import { useSubscriptionActions } from "./hooks/useSubscriptionActions";
import { useSubscriptionMetrics } from "./hooks/useSubscriptionMetrics";
import { useSubscriptionStatus } from "./hooks/useSubscriptionStatus";

import SubscriptionHero from "./sections/SubscriptionHero";
import SubscriptionTimeline from "./sections/SubscriptionTimeline";
import SubscriptionOverview from "./sections/SubscriptionOverview";
import SubscriptionAdminActions from "./sections/SubscriptionAdminActions";

import Card, { CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Modal, {
	ModalBody,
	ModalFooter,
	ModalHeader,
} from "@/components/ui/Modal";
import { CenterLoader } from "@/components/ui/Loader";

import { AlertTriangle, XCircle } from "lucide-react";
import { paymentApi } from "@/lib/api/payment";

type Role = "customer" | "staff" | "superadmin";

interface Props {
	accountId: string;
	role: Role;
}

/* ====================================================== */

export default function SubscriptionPanel({
	accountId,
	role,
}: Props) {
	/* ================= DATA ================= */

	const {
		subscription,
		isLoading,
		error,
		refetch,
	} = useSubscription(accountId);

	/* ================= ACTIONS ================= */

	const actions = useSubscriptionActions({
		subscriptionId: subscription?.id,
		accountId,
	});

	/* ================= DERIVED ================= */

	const statusState = useSubscriptionStatus(subscription, role);
	const metrics = useSubscriptionMetrics(subscription);

	const {
		status,
		isExpired,
		isSuspended,
		canManage,
		canRenew,
	} = statusState;

	/* ================= MODALS ================= */

	const [showSuspendModal, setShowSuspendModal] = useState(false);
	const [showCancelModal, setShowCancelModal] = useState(false);
	const [showRenewModal, setShowRenewModal] = useState(false);
	const [renewCycles, setRenewCycles] = useState(1);

	const [suspendReason, setSuspendReason] = useState("");
	const [cancelReason, setCancelReason] = useState("");

	const [creatingPayment, setCreatingPayment] = useState(false);

	/* ================= RENEW FLOW ================= */

	const openRenewModal = () => {
		if (!subscription) return;

		setRenewCycles(subscription.cycles || 1);
		setShowRenewModal(true);
	};
	const confirmRenew = async () => {
		if (!subscription) return;

		try {
			setCreatingPayment(true);

			const res = await paymentApi.create({
				accountId,
				subscriptionId: subscription.id,
				planId: subscription.planId,
				cycles: renewCycles, // 🔥 KEY CHANGE
			});

			const url = res.data.paystack?.data.authorization_url;

			if (url) window.location.href = url;

		} catch (err) {
			console.error(err);
		} finally {
			setCreatingPayment(false);
		}
	};

	/* ================= LOADING ================= */

	if (isLoading) {
		return <CenterLoader label="Loading subscription..." />;
	}

	/* ================= ERROR ================= */

	if (error) {
		return (
			<Card>
				<CardContent className="py-12 text-center">
					<XCircle className="mx-auto mb-3 text-danger" />
					<h3>Failed to load subscription</h3>

					<Button className="mt-5" onClick={() => refetch()}>
						Retry
					</Button>
				</CardContent>
			</Card>
		);
	}

	/* ================= EMPTY ================= */

	if (!subscription) {
		return (
			<Card>
				<CardContent className="py-14 text-center">
					<AlertTriangle className="mx-auto mb-4 text-warning" />

					<h3>No Active Subscription</h3>

					<div className="mt-6 flex justify-center gap-3">
						<Button variant="outline" onClick={() => refetch()}>
							Refresh
						</Button>
					</div>
				</CardContent>
			</Card>
		);
	}

	/* ================= UI ================= */

	return (
		<>
			<div className="space-y-8">
				{/* HERO */}
				<SubscriptionHero
					subscription={subscription}
					status={status}
					canRenew={canRenew}
					canManage={canManage}
					onRenew={openRenewModal}
					renewing={creatingPayment}
				/>

				{/* TIMELINE */}
				<SubscriptionTimeline
					progress={metrics.progress}
					daysLeft={metrics.daysLeft}
					isExpired={isExpired}
					startDate={metrics.startDate}
					endDate={metrics.endDate}
				/>

				{/* OVERVIEW */}
				<SubscriptionOverview subscription={subscription} />

				{/* ADMIN ACTIONS */}
				{canManage && (
					<SubscriptionAdminActions
						isSuspended={isSuspended}
						onSuspend={() => setShowSuspendModal(true)}
						onCancel={() => setShowCancelModal(true)}
						onResume={() =>
							actions.resumeMutation.mutate()
						}
						onExtend={() =>
							actions.extendMutation.mutate()
						}
						onForceExpire={() =>
							actions.forceExpireMutation.mutate()
						}
						loadingStates={{
							resume:
								actions.resumeMutation.isPending,
							extend:
								actions.extendMutation.isPending,
							forceExpire:
								actions.forceExpireMutation.isPending,
						}}
					/>
				)}
			</div>

			{/* ================= RENEW MODAL ================= */}

			<Modal open={showRenewModal} onClose={() => setShowRenewModal(false)}>
	<ModalHeader>Renew Subscription</ModalHeader>

	<ModalBody>
		<div className="space-y-4">

			{/* PLAN CARD */}
			<div className="rounded-2xl border p-4 bg-muted/30">
				<p className="font-semibold text-base">
					{subscription?.planSnapshot?.name}
				</p>

				<p className="text-sm text-muted-foreground">
					₦{subscription?.planSnapshot?.price?.toLocaleString()} per cycle
				</p>
			</div>

			{/* CYCLE CONTROLLER */}
			<div className="flex items-center justify-between rounded-2xl border p-3">

				<button
					className="h-10 w-10 rounded-xl border flex items-center justify-center"
					onClick={() =>
						setRenewCycles((c) => Math.max(1, c - 1))
					}
				>
					−
				</button>

				<div className="text-center">
					<p className="font-medium">
						{renewCycles} cycle{renewCycles > 1 ? "s" : ""}
					</p>

					<p className="text-xs text-muted-foreground">
						Adjust duration of renewal
					</p>
				</div>

				<button
					className="h-10 w-10 rounded-xl border flex items-center justify-center"
					onClick={() =>
						setRenewCycles((c) => c + 1)
					}
				>
					+
				</button>
			</div>

			{/* TOTAL */}
			<div className="rounded-2xl border p-4 bg-primary/5">
				<p className="text-sm text-muted-foreground">
					Total Amount
				</p>

				<p className="text-xl font-bold">
					₦
					{(
						(subscription?.planSnapshot?.price || 0) *
						renewCycles
					).toLocaleString()}
				</p>
			</div>

			<p className="text-xs text-muted-foreground">
				You can increase or reduce billing cycles before payment.
			</p>

		</div>
	</ModalBody>

	<ModalFooter>
		<Button
			variant="outline"
			onClick={() => setShowRenewModal(false)}
		>
			Cancel
		</Button>

		<Button
			onClick={confirmRenew}
			disabled={creatingPayment}
		>
			{creatingPayment ? "Processing..." : "Confirm & Pay"}
		</Button>
	</ModalFooter>
</Modal>

			{/* ================= SUSPEND MODAL ================= */}

			<Modal
				open={showSuspendModal}
				onClose={() =>
					setShowSuspendModal(false)
				}
			>
				<ModalHeader>Suspend</ModalHeader>

				<ModalBody>
					<textarea
						className="ui-textarea w-full min-h-[120px]"
						value={suspendReason}
						onChange={(e) =>
							setSuspendReason(e.target.value)
						}
					/>
				</ModalBody>

				<ModalFooter>
					<Button
						onClick={() =>
							setShowSuspendModal(false)
						}
					>
						Cancel
					</Button>

					<Button
						variant="danger"
						onClick={() =>
							actions.suspendMutation.mutate(
								suspendReason
							)
						}
					>
						Suspend
					</Button>
				</ModalFooter>
			</Modal>

			{/* ================= CANCEL MODAL ================= */}

			<Modal
				open={showCancelModal}
				onClose={() =>
					setShowCancelModal(false)
				}
			>
				<ModalHeader>Cancel</ModalHeader>

				<ModalBody>
					<textarea
						className="ui-textarea w-full min-h-[120px]"
						value={cancelReason}
						onChange={(e) =>
							setCancelReason(e.target.value)
						}
					/>
				</ModalBody>

				<ModalFooter>
					<Button
						onClick={() =>
							setShowCancelModal(false)
						}
					>
						Close
					</Button>

					<Button
						variant="danger"
						onClick={() =>
							actions.cancelMutation.mutate(
								cancelReason
							)
						}
					>
						Cancel
					</Button>
				</ModalFooter>
			</Modal>
		</>
	);
}
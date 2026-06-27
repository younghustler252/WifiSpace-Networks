"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { useSubscription } from "./hooks/useSubscription";
import { useSubscriptionActions } from "./hooks/useSubscriptionActions";
import { useSubscriptionMetrics } from "./hooks/useSubscriptionMetrics";
import { useSubscriptionStatus } from "./hooks/useSubscriptionStatus";

import { planApi } from "@/lib/api/plan";
import SubscriptionHero from "./sections/SubscriptionHero";
import SubscriptionTimeline from "./sections/SubscriptionTimeline";
import SubscriptionOverview from "./sections/SubscriptionOverview";
import SubscriptionActions from "./sections/SubscriptionActions";

import Card, { CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Modal, {
	ModalBody,
	ModalFooter,
	ModalHeader,
} from "@/components/ui/Modal";
import { CenterLoader } from "@/components/ui/Loader";

import { AlertTriangle, XCircle, Calendar, ShieldAlert, Plus } from "lucide-react";
import { paymentApi } from "@/lib/api/payment";

const notify = {
	success: (msg: string) => alert(`Success: ${msg}`),
	error: (msg: string) => alert(`Error: ${msg}`),
};

type Role = "customer" | "staff" | "superadmin";

interface Props {
	accountId: string;
	role: Role;
}


export function useCachedPlans() {
	return useQuery({
		queryKey: ["admin-plans-lookup"],
		queryFn: async () => {
			// Request a higher limit to return all configurations in one pass
			const res = await planApi.getAll({ limit: 100 });
			return res.data;
		},
		// 💡 Performance Cache Matrix Config:
		staleTime: 10 * 60 * 1000, // Consider data fresh for 10 minutes
		gcTime: 15 * 60 * 1000,    // Keep garbage collection layer alive in cache background
		select: (data) => data?.data ?? [], // Extract the plans array directly
	});
}

export default function SubscriptionPanel({
	accountId,
	role,
}: Props) {
	const router = useRouter();

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
	} = statusState;

	/* ================= USER/CUSTOMER MODALS ================= */
	const [showRenewModal, setShowRenewModal] = useState(false);
	const [renewCycles, setRenewCycles] = useState(1);
	const [creatingPayment, setCreatingPayment] = useState(false);

	/* ================= ADMIN OPERATIONAL MODALS ================= */
	const [showSuspendModal, setShowSuspendModal] = useState(false);
	const [showCancelModal, setShowCancelModal] = useState(false);
	const [showAdminRenewModal, setShowAdminRenewModal] = useState(false);
	const [showExtendModal, setShowExtendModal] = useState(false);
	const [showChangePlanModal, setShowChangePlanModal] = useState(false);
	const [showAssignModal, setShowAssignModal] = useState(false);

	/* ================= ADMIN FORM STATES ================= */
	const [suspendReason, setSuspendReason] = useState("");
	const [adminReason, setAdminReason] = useState("");
	const [extendDays, setExtendDays] = useState(30);
	const [targetPlanId, setTargetPlanId] = useState("");
	const [paymentAdjustment, setPaymentAdjustment] = useState("0");

	// Add this near your other data custom hook references at the top of SubscriptionPanel:
	const { data: plans = [], isLoading: isLoadingPlans } = useCachedPlans();


	/* ================= USER RENEW FLOW (PAYSTACK) ================= */
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
				planId: subscription.planId?._id,
				cycles: renewCycles,
			});

			const url = res.data.paystack?.data.authorization_url;	
			if (url) window.location.href = url;
		} catch (err: any) {
			console.error(err);
			notify.error(err?.message || "Failed to initialize payment gateway.");
		} finally {
			setCreatingPayment(false);
		}
	};

	const upgradeSubscription = () => {
		router.push(
			`/customer/plans?mode=upgrade&currentPlan=${subscription?.planId?._id || subscription?.planId}`
		);
	};

	/* ================= ADMIN ACTION HANDLERS ================= */
		/* ================= ADMIN ACTION HANDLERS ================= */
	const handleAdminRenewSubmit = () => {
		actions.adminRenewMutation.mutate(
			{ 
				cycles: renewCycles,
				reason: adminReason || "Admin manual override renewal",
				reference: `ADM-BYP-${Date.now()}`
			},
			{
				onSuccess: () => {
					notify.success("Subscription renewed successfully by admin.");
					setShowAdminRenewModal(false);
					setAdminReason("");
					setRenewCycles(1); // Safely reset state counter
				},
				onError: (err: any) => notify.error(err?.message || "Admin renewal failed."),
			}
		);
	};


	const handleAdminExtendSubmit = () => {
		actions.extendMutation.mutate(
			{ days: Number(extendDays), reason: adminReason || "Admin custom extension" },
			{
				onSuccess: () => {
					notify.success(`Timeline extended safely by ${extendDays} days.`);
					setShowExtendModal(false);
					setAdminReason("");
					setExtendDays(30);
				},
				onError: (err: any) => notify.error(err?.message || "Timeline extension failed."),
			}
		);
	};

	const handleAdminChangePlanSubmit = () => {
		if (!targetPlanId) return notify.error("Please enter a valid Target Plan ID.");
		
		actions.adminChangePlanMutation.mutate(
			{
				newPlanId: targetPlanId,
				reason: adminReason || "Administrative tier migration",
				paymentAdjustment: Number(paymentAdjustment || 0),
			},
			{
				onSuccess: () => {
					notify.success("Account moved to new plan tier successfully.");
					setShowChangePlanModal(false);
					setAdminReason("");
					setTargetPlanId("");
					setPaymentAdjustment("0");
				},
				onError: (err: any) => notify.error(err?.message || "Failed to change subscription plan."),
			}
		);
	};

	const handleSuspendSubmit = () => {
		actions.suspendMutation.mutate(suspendReason, {
			onSuccess: () => {
				notify.success("Subscription context suspended successfully.");
				setShowSuspendModal(false);
				setSuspendReason("");
			},
			onError: (err: any) => notify.error(err?.message || "Suspension failed."),
		});
	};

		const handleForceExpireSubmit = () => {
			actions.forceExpireMutation.mutate(
				{ reason: adminReason },
				{
					onSuccess: () => {
						notify.success("Subscription forced into expired state.");
						setShowCancelModal(false);
						setAdminReason(""); // Clear state out safely
					},
					onError: (err: any) => notify.error(err?.message || "Termination failed."),
				}
			);
		};


	/* ================= CONDITIONS LOADING / ERRORS / BLANK ================= */
	if (isLoading) return <CenterLoader label="Loading subscription..." />;

	if (error) {
		return (
			<Card>
				<CardContent className="py-12 text-center">
					<XCircle className="mx-auto mb-3 text-danger" />
					<h3>Failed to load subscription</h3>
					<Button className="mt-5" onClick={() => refetch()}>Retry</Button>
				</CardContent>
			</Card>
		);
	}

	if (!subscription) {
		return (
			<Card>
				<CardContent className="py-14 text-center">
					<AlertTriangle className="mx-auto mb-4 text-warning" />
					<h3>No Active Subscription</h3>
					<div className="mt-6 flex justify-center gap-3">
						<Button variant="outline" onClick={() => refetch()}>Refresh</Button>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<>
			<div className="grid gap-8 lg:grid-cols-12">
				{/* LEFT CONTENT */}
				<div className="space-y-8 lg:col-span-8">
					<SubscriptionHero subscription={subscription} status={status} />
					<SubscriptionTimeline
						progress={metrics.progress}
						daysLeft={metrics.daysLeft}
						isExpired={isExpired}
						startDate={metrics.startDate}
						endDate={metrics.endDate}
					/>
					<SubscriptionOverview subscription={subscription} />
				</div>

				{/* RIGHT SIDEBAR ACTIONS */}
				<div className="lg:col-span-4">
					<div className="space-y-6 lg:sticky lg:top-6">
						<SubscriptionActions
							role={role}
							hasActiveSubscription={!isExpired}
							isSuspended={isSuspended}
							onRenew={openRenewModal}
							onUpgrade={upgradeSubscription}
							onAssign={() => {
								setTargetPlanId(""); // Clear any old selections
								setRenewCycles(1);   // Default to 1 month/cycle
								setAdminReason("Initial administrative account assignment");
								setShowAssignModal(true);
							}}

							onSuspend={() => setShowSuspendModal(true)}
							onResume={() => actions.resumeMutation.mutate(undefined, {
								onSuccess: () => notify.success("Subscription resumed safely."),
								onError: (err: any) => notify.error(err?.message),
							})}
							
							onExtend={() => setShowExtendModal(true)} // Opens Modal instead of blind mutation
							onExpire={() => setShowCancelModal(true)}
							
							onAdminRenew={() => {
								setRenewCycles(1); // Resets counter state before opening modal
								setShowAdminRenewModal(true);
							}}

							onAdminChangePlan={() => setShowChangePlanModal(true)} // Wires up Change Plan Modal Trigger

							loadingStates={{
								resume: actions.resumeMutation.isPending,
								extend: actions.extendMutation.isPending,
								expire: actions.forceExpireMutation.isPending,
								adminRenew: actions.adminRenewMutation.isPending,
								adminChangePlan: actions.adminChangePlanMutation.isPending,
								suspend: actions.suspendMutation.isPending
							}}
						/>
					</div>
				</div>
			</div>

			{/* ================= USER RENEW MODAL (PAYMENT CHANNELS) ================= */}
			<Modal open={showRenewModal} onClose={() => setShowRenewModal(false)}>
				<ModalHeader>Renew Subscription</ModalHeader>
				<ModalBody>
					<div className="space-y-4">
						<p className="text-xs text-muted-foreground leading-relaxed">
							Review your plan details and specify how many cycles you want to add before proceeding to secure payment.
						</p>

						{/* PLAN SUMMARY FIELD */}
						<div className="space-y-1.5">
							<label className="text-xs font-medium text-neutral-600">Selected Plan Configuration</label>
							<div className="ui-input w-full bg-neutral-50 text-neutral-700 flex flex-col justify-center h-14 border select-none px-3 rounded-lg">
								<p className="font-semibold text-sm">{subscription?.planSnapshot?.name || "Active Tier"}</p>
								<p className="text-xs text-muted-foreground">₦{subscription?.planSnapshot?.price?.toLocaleString()} per cycle</p>
							</div>
						</div>

						{/* INPUT CONTROLS GRID */}
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-1.5">
								<label className="text-xs font-medium text-neutral-600">Cycles to Purchase</label>
								<input
									type="number"
									min={1}
									required
									className="ui-input w-full"
									value={renewCycles}
									onChange={(e) => setRenewCycles(Math.max(1, Number(e.target.value)))}
								/>
							</div>

							<div className="space-y-1.5">
								<label className="text-xs font-medium text-neutral-600">Total Due Amount</label>
								<div className="ui-input w-full bg-neutral-50 font-bold text-neutral-900 flex items-center h-10 border select-none">
									₦{((subscription?.planSnapshot?.price || 0) * renewCycles).toLocaleString()}
								</div>
							</div>
						</div>
					</div>
				</ModalBody>
				<ModalFooter>
					<Button variant="outline" onClick={() => setShowRenewModal(false)}>Cancel</Button>
					<Button onClick={confirmRenew} disabled={creatingPayment}>
						{creatingPayment ? "Processing..." : "Confirm & Pay"}
					</Button>
				</ModalFooter>
			</Modal>


			{/* ================= ADMIN RENEW OVERRIDE MODAL (NO PAYMENT) ================= */}
			<Modal open={showAdminRenewModal} onClose={() => setShowAdminRenewModal(false)}>
				<ModalHeader>
					<div className="flex items-center gap-2">
						<ShieldAlert className="w-5 h-5 text-amber-500" />
						<span>Admin Renewal Override</span>
					</div>
				</ModalHeader>
				<ModalBody>
					<div className="space-y-4">
						<p className="text-xs text-muted-foreground leading-relaxed">
							This action bypasses payment gateways entirely to trigger a manual subscription renewal cycle.
						</p>

						{/* INPUT CONTROLS GRID */}
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-1.5">
								<label className="text-xs font-medium text-neutral-600">Cycles to Provision</label>
								<input
									type="number"
									min={1}
									required
									className="ui-input w-full"
									value={renewCycles}
									onChange={(e) => setRenewCycles(Math.max(1, Number(e.target.value)))}
								/>
							</div>

							<div className="space-y-1.5">
								<label className="text-xs font-medium text-neutral-600">Calculated Value</label>
								<div className="ui-input w-full bg-neutral-50 font-semibold text-neutral-700 flex items-center h-10 border select-none">
									₦{((subscription?.planSnapshot?.price || 0) * renewCycles).toLocaleString()}
								</div>
							</div>
						</div>

						{/* AUDIT LOG FIELD */}
						<div className="space-y-1.5">
							<label className="text-xs font-medium text-neutral-600">Audit / Log Reason</label>
							<textarea
								required
								className="ui-textarea w-full min-h-[90px] text-sm"
								placeholder="State regulatory or technical reason for payment bypass..."
								value={adminReason}
								onChange={(e) => setAdminReason(e.target.value)}
							/>
						</div>
					</div>
				</ModalBody>
				<ModalFooter>
					<Button variant="outline" onClick={() => setShowAdminRenewModal(false)}>Cancel</Button>
					<Button variant="accent" onClick={handleAdminRenewSubmit} isLoading={actions.adminRenewMutation.isPending}>Confirm Bypass</Button>
				</ModalFooter>
			</Modal>


			{/* ================= ADMIN TIMELINE EXTENSION MODAL ================= */}
			<Modal open={showExtendModal} onClose={() => setShowExtendModal(false)}>
				<ModalHeader>
					<div className="flex items-center gap-2">
						<Calendar className="w-5 h-5 text-blue-500" />
						<span>Extend Operation Terminus</span>
					</div>
				</ModalHeader>
				<ModalBody>
					<div className="space-y-4">
						<p className="text-xs text-muted-foreground leading-relaxed">
							Appends additional active runtime days directly onto this account's terminal operational window.
						</p>

						{/* INPUT CONTROLS GRID */}
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-1.5">
								<label className="text-xs font-medium text-neutral-600">Days to Append</label>
								<input
									type="number"
									min={1}
									required
									className="ui-input w-full"
									value={extendDays}
									onChange={(e) => setExtendDays(Math.max(1, Number(e.target.value)))}
								/>
							</div>

							{/* PRESET SELECT DROPDOWN */}
							<div className="space-y-1.5">
								<label className="text-xs font-medium text-neutral-600">Preset Category</label>
								<select
									className="ui-input w-full"
									defaultValue="Network downtime compensation"
									onChange={(e) => {
										const val = e.target.value;
										if (val === "custom") {
											setAdminReason(""); // Clear for manual typing
										} else {
											setAdminReason(val); // Auto-populate preset text
										}
									}}
								>
									<option value="Network downtime compensation">Downtime Compensation</option>
									<option value="Goodwill gesture / Customer retention">Goodwill Gesture</option>
									<option value="Billing dispute reconciliation">Dispute Resolution</option>
									<option value="Staff internal testing account extension">Internal Testing</option>
									<option value="custom">Other (Write custom reason...)</option>
								</select>
							</div>
						</div>

						{/* AUDIT LOG FIELD */}
						<div className="space-y-1.5">
							<label className="text-xs font-medium text-neutral-600">Audit Log Description</label>
							<textarea
								required
								className="ui-textarea w-full min-h-[80px] text-sm"
								placeholder="Provide a mandatory reason for this timeline modification..."
								value={adminReason || "Network downtime compensation"} // Safe fallback initial value
								onChange={(e) => setAdminReason(e.target.value)}
							/>
						</div>
					</div>
				</ModalBody>
				<ModalFooter>
					<Button variant="outline" onClick={() => setShowExtendModal(false)}>Cancel</Button>
					<Button onClick={handleAdminExtendSubmit} isLoading={actions.extendMutation.isPending}>Apply Extension</Button>
				</ModalFooter>
			</Modal>


						{/* ================= ADMIN MIGRATE PLAN MODAL ================= */}
			<Modal open={showChangePlanModal} onClose={() => setShowChangePlanModal(false)}>
				<ModalHeader>
					<div className="flex items-center gap-2">
						<Calendar className="w-5 h-5 text-accent" />
						<span>Migrate Subscription Plan</span>
					</div>
				</ModalHeader>
				<ModalBody>
					<div className="space-y-4">
						<p className="text-xs text-muted-foreground leading-relaxed">
							Immediately overrides underlying configurations and shifts this account's operational profiling tier.
						</p>

						{/* INPUT CONTROLS GRID */}
						<div className="grid grid-cols-2 gap-4">
							
							{/* DYNAMIC LOOKUP SELECT PLAN DROPDOWN */}
							<div className="space-y-1.5 col-span-2 md:col-span-1">
								<label className="text-xs font-medium text-neutral-600">Target Service Plan</label>
								<select
									required
									className="ui-input w-full"
									value={targetPlanId}
									onChange={(e) => setTargetPlanId(e.target.value)}
									disabled={isLoadingPlans}
								>
									<option value="">Select a new plan tier...</option>
									{plans
										// Smart Filter: Only show active plans that match the user's active connection medium (pppoe/hotspot)
										.filter((p: any) => p.status === "active" && p.serviceType === subscription?.planSnapshot?.serviceType)
										.map((p: any) => (
											<option key={p.id || p._id} value={p.id || p._id}>
												{p.name} (₦{p.price?.toLocaleString()} | {p.speedRate})
											</option>
										))
									}
								</select>
								{isLoadingPlans && <p className="text-[10px] text-muted-foreground animate-pulse">Loading cached system plans...</p>}
							</div>

							<div className="space-y-1.5 col-span-2 md:col-span-1">
								<label className="text-xs font-medium text-neutral-600">Balance Adjustment</label>
								<input
									type="number"
									className="ui-input w-full"
									placeholder="e.g. 5000 or -2000"
									value={paymentAdjustment}
									onChange={(e) => setPaymentAdjustment(e.target.value)}
								/>
							</div>
						</div>

						{/* PRESET SELECT DROPDOWN FOR REASON */}
						<div className="space-y-1.5">
							<label className="text-xs font-medium text-neutral-600">Migration Reason Category</label>
							<select
								className="ui-input w-full"
								defaultValue="Administrative profile migration"
								onChange={(e) => {
									const val = e.target.value;
									if (val === "custom") {
										setAdminReason(""); 
									} else {
										setAdminReason(val); 
									}
								}}
							>
								<option value="Administrative profile migration">Administrative Tier Migration</option>
								<option value="Customer requested upgrade recalculation">Requested Tier Upgrade</option>
								<option value="Account structural troubleshooting reset">Technical Profile Correction</option>
								<option value="custom">Other (Write custom reason...)</option>
							</select>
						</div>

						{/* MANDATORY DETAILS FIELD */}
						<div className="space-y-1.5">
							<label className="text-xs font-medium text-neutral-600">Audit Log Details</label>
							<textarea
								required
								className="ui-textarea w-full min-h-[80px] text-sm"
								placeholder="Provide specific notes regarding why this plan change is being executed..."
								value={adminReason || "Administrative profile migration"}
								onChange={(e) => setAdminReason(e.target.value)}
							/>
						</div>
					</div>
				</ModalBody>
				<ModalFooter>
					<Button variant="outline" onClick={() => setShowChangePlanModal(false)}>Cancel</Button>
					<Button 
						variant="accent" 
						onClick={handleAdminChangePlanSubmit} 
						isLoading={actions.adminChangePlanMutation.isPending}
						disabled={!targetPlanId}
					>
						Execute Migration
					</Button>
				</ModalFooter>
			</Modal>


			{/* ================= SUSPEND MODAL ================= */}
			<Modal open={showSuspendModal} onClose={() => setShowSuspendModal(false)}>
				<ModalHeader>Suspend Subscription</ModalHeader>
				<ModalBody>
					<div className="space-y-2">
						<label className="text-xs font-semibold text-neutral-700">Reason for Suspension</label>
						<textarea
							className="ui-textarea w-full min-h-[120px]"
							placeholder="State compliance or routing suspension context..."
							value={suspendReason}
							onChange={(e) => setSuspendReason(e.target.value)}
						/>
					</div>
				</ModalBody>
				<ModalFooter>
					<Button variant="outline" onClick={() => setShowSuspendModal(false)}>Cancel</Button>
					<Button variant="danger" onClick={handleSuspendSubmit} isLoading={actions.suspendMutation.isPending}>Suspend</Button>
				</ModalFooter>
			</Modal>

			{/* ================= FORCE EXPIRE TERMINATION MODAL ================= */}
						{/* ================= FORCE EXPIRE TERMINATION MODAL ================= */}
			<Modal open={showCancelModal} onClose={() => setShowCancelModal(false)}>
				<ModalHeader>
					<div className="flex items-center gap-2 text-danger">
						<ShieldAlert className="w-5 h-5" />
						<span>Forced Lifecycle Expiration</span>
					</div>
				</ModalHeader>
				<ModalBody>
					<div className="space-y-4">
						<p className="text-xs text-muted-foreground leading-relaxed">
							This action kills active provisioning states and cuts off live internet access immediately.
						</p>

						{/* INPUT CONTROLS GRID */}
						<div className="grid grid-cols-1 gap-4">
							{/* PRESET SELECT DROPDOWN */}
							<div className="space-y-1.5">
								<label className="text-xs font-medium text-neutral-600">Termination Category</label>
								<select
									className="ui-input w-full border-danger/20 focus:border-danger"
									defaultValue="Account termination / TOS violation"
									onChange={(e) => {
										const val = e.target.value;
										if (val === "custom") {
											setAdminReason(""); // Clear input box for custom text
										} else {
											setAdminReason(val); // Populate preset phrase
										}
									}}
								>
									<option value="Account termination / TOS violation">TOS Violation / Abuse</option>
									<option value="Manual override for billing migration">Billing Profile Reset</option>
									<option value="Customer request for immediate cancellation">Customer Express Request</option>
									<option value="Fraudulent transaction recovery action">Fraud Mitigation</option>
									<option value="custom">Other (Write custom reason...)</option>
								</select>
							</div>
						</div>

						{/* MANDATORY DETAILS FIELD */}
						<div className="space-y-1.5">
							<label className="text-xs font-medium text-neutral-600">Audit Log Description</label>
							<textarea
								required
								className="ui-textarea w-full min-h-[80px] text-sm focus:border-danger"
								placeholder="Detail why this terminal state expiration is being enforced..."
								value={adminReason || "Account termination / TOS violation"} // Safe initial sync fallback
								onChange={(e) => setAdminReason(e.target.value)}
							/>
						</div>
					</div>
				</ModalBody>
				<ModalFooter>
					<Button variant="outline" onClick={() => setShowCancelModal(false)}>Cancel</Button>
					<Button variant="danger" onClick={handleForceExpireSubmit} isLoading={actions.forceExpireMutation.isPending}>Terminate Context</Button>
				</ModalFooter>
			</Modal>

						{/* ================= ADMIN ASSIGN SUBSCRIPTION MODAL ================= */}
			<Modal open={showAssignModal} onClose={() => setShowAssignModal(false)}>
				<ModalHeader>
					<div className="flex items-center gap-2">
						<Plus className="w-5 h-5 text-success" />
						<span>Assign New Subscription</span>
					</div>
				</ModalHeader>
				<ModalBody>
					<div className="space-y-4">
						<p className="text-xs text-muted-foreground leading-relaxed">
							Provisions a brand new network access profile for account identification context <b className="text-neutral-700">{accountId}</b>.
						</p>

						{/* INPUT CONTROLS GRID */}
						<div className="grid grid-cols-2 gap-4">
							
							{/* CHOOSE CACHED PLAN */}
							<div className="space-y-1.5 col-span-2 md:col-span-1">
								<label className="text-xs font-medium text-neutral-600">Select Initial Plan</label>
								<select
									required
									className="ui-input w-full"
									value={targetPlanId}
									onChange={(e) => setTargetPlanId(e.target.value)}
									disabled={isLoadingPlans}
								>
									<option value="">Choose service tier...</option>
									{plans
										.filter((p: any) => p.status === "active")
										.map((p: any) => (
											<option key={p.id || p._id} value={p.id || p._id}>
												{p.name} (₦{p.price?.toLocaleString()} | {p.serviceType.toUpperCase()})
											</option>
										))
									}
								</select>
								{isLoadingPlans && <p className="text-[10px] text-muted-foreground animate-pulse">Loading system plans...</p>}
							</div>

							{/* CYCLES SELECTION */}
							<div className="space-y-1.5 col-span-2 md:col-span-1">
								<label className="text-xs font-medium text-neutral-600">Cycles / Months</label>
								<input
									type="number"
									min={1}
									required
									className="ui-input w-full"
									value={renewCycles}
									onChange={(e) => setRenewCycles(Math.max(1, Number(e.target.value)))}
								/>
							</div>
						</div>

						{/* TOTAL DUE CALCULATION BOX */}
						{targetPlanId && (
							<div className="space-y-1.5">
								<label className="text-xs font-medium text-neutral-600">Calculated Plan Provision Value</label>
								<div className="ui-input w-full bg-neutral-50 font-bold text-green-700 flex items-center h-10 border select-none px-3 rounded-lg">
									₦{(() => {
										const selectedPlan = plans.find((p: any) => (p.id || p._id) === targetPlanId);
										return ((selectedPlan?.price || 0) * renewCycles).toLocaleString();
									})()}
								</div>
							</div>
						)}

						{/* AUDIT LOG FIELD */}
						<div className="space-y-1.5">
							<label className="text-xs font-medium text-neutral-600">Audit / Log Reason</label>
							<textarea
								required
								className="ui-textarea w-full min-h-[85px] text-sm"
								placeholder="State reasoning details for provisioning this new profile context manual override..."
								value={adminReason}
								onChange={(e) => setAdminReason(e.target.value)}
							/>
						</div>
					</div>
				</ModalBody>
				<ModalFooter>
					<Button variant="outline" onClick={() => setShowAssignModal(false)}>Cancel</Button>
						<Button 
						variant="accent" 
						disabled={!targetPlanId}
						isLoading={actions.adminCreateSubscriptionMutation?.isPending || false}
						onClick={() => {
							actions.adminCreateSubscriptionMutation.mutate(
								{
									accountId,
									planId: targetPlanId,
									cycles: renewCycles,
									
									// 🔥 1. Map the User Identification context safely from active panel dataset
									userId: subscription?.userId, 

									// 🔥 2. Set this to true so admin actions override zombie background records
									overrideExisting: true, 

									// 🔥 3. Map your state string context to match backend destructuring variable
									reason: adminReason || "Initial administrative account assignment"
								},
								{
									onSuccess: () => {
										notify.success("New subscription assigned and activated successfully.");
										setShowAssignModal(false);
										refetch(); // Refetches core data so state moves from null to active
									},
									onError: (err: any) => notify.error(err?.message || "Failed to create subscription context.")
								}
							);
						}}
					>
						Assign & Provision
					</Button>

				</ModalFooter>
			</Modal>


		</>
	);
}

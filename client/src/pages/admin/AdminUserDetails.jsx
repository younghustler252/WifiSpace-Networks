import { useState } from "react";
import { useParams } from "react-router-dom";

import { FullScreenSpinner } from "../../components/ui/Loader";
import Avatar from "../../components/ui/Avatar";
import StatsCard from "../../components/StatsCard";
import BackButton from "../../components/ui/BackButton";
import PaymentsSection from "../../components/PaymentsSection";
import CircularProgress from "../../components/CircularProgress";
import StatusBadge from "../../components/ui/StatusBadge";

import {
	Wifi,
	Upload,
	Download,
	Users,
	Clock,
	DollarSign,
	Server,
	Calendar,
} from "lucide-react";

import { formatBytes, formatTime } from "../../utils/formatters";

import {
	useUserById,
	useBanUser,
	useAssignSubscription,
} from "../../hooks/useAdmin";

import { useAllPlans } from "../../hooks/useSubscription";

/* ------------------------------------------------------------
   Helpers
------------------------------------------------------------ */
const getSubscriptionProgress = (start, end) => {
	const startDate = new Date(start);
	const endDate = new Date(end);
	const today = new Date();

	const totalMs = endDate - startDate;
	const usedMs = today - startDate;

	const totalDays = Math.max(
		1,
		Math.ceil(totalMs / (1000 * 60 * 60 * 24))
	);

	const usedDays = Math.max(
		0,
		Math.ceil(usedMs / (1000 * 60 * 60 * 24))
	);

	const remainingDays = Math.max(0, totalDays - usedDays);

	const percentRemaining = Math.round(
		(remainingDays / totalDays) * 100
	);

	return {
		totalDays,
		usedDays,
		remainingDays,
		percentRemaining,
	};
};

/* ------------------------------------------------------------
   Component
------------------------------------------------------------ */
const AdminUserDetails = () => {
	const { id } = useParams();

	const { data, isLoading, isError } = useUserById(id);
	const { mutate: banUser } = useBanUser();
	const {
		mutate: assignSubscription,
		isPending: isAssigning,
	} = useAssignSubscription();

	const { data: plans = [], isLoading: plansLoading } = useAllPlans();

	const [selectedPlan, setSelectedPlan] = useState("");
	const [startDate, setStartDate] = useState("");
	const [feedback, setFeedback] = useState(null);

	if (isLoading || plansLoading)
		return <FullScreenSpinner message="Loading user details..." />;

	if (isError)
		return (
			<div className="card text-center text-danger py-6">
				Failed to load user details.
			</div>
		);

	const user = data.user;
	const subscription = data.subscription || null;
	const usage = data.usage || null;
	const payments = data.recentPayments || [];

	const subscriptionMeta = subscription
		? getSubscriptionProgress(subscription.start, subscription.end)
		: null;

	const toggleBan = () =>
		banUser({ id: user._id, ban: !user.isBanned });

	const handleAssignSubscription = () => {
		if (!selectedPlan) {
			setFeedback({
				type: "error",
				message: "Please select a subscription plan.",
			});
			return;
		}

		assignSubscription(
			{
				userId: user._id,
				subscriptionData: {
					subscriptionId: selectedPlan,
					startDate: startDate || new Date().toISOString(),
				},
			},
			{
				onSuccess: () => {
					setFeedback({
						type: "success",
						message: "Subscription assigned successfully.",
					});
					setSelectedPlan("");
					setStartDate("");
				},
				onError: (err) => {
					setFeedback({
						type: "error",
						message:
							err?.response?.data?.message ||
							"Failed to assign subscription.",
					});
				},
			}
		);
	};

	return (
		<div className="max-w-7xl mx-auto p-4 md:p-6 space-y-8">

			<BackButton />

			{/* ================= USER HEADER ================= */}
			<div className="card flex flex-col md:flex-row items-start md:items-center gap-6">
				<Avatar
					src={user.profilePicture || null}
					firstName={user.firstName}
					lastName={user.lastName}
					size={72}
				/>

				<div className="flex-1 space-y-1">
					<h1 className="text-2xl font-bold text-primary">
						{user.firstName} {user.lastName}
					</h1>
					<p className="text-secondary">{user.email}</p>
					<p className="text-sm text-muted">
						WSN ID: {user.wsnId || "N/A"}
					</p>
					<p className="text-sm text-muted capitalize">
						Role: {user.role}
					</p>

					<div className="mt-2">
						<StatusBadge
							status={user.isBanned ? "suspended" : "active"}
						/>
					</div>
				</div>

				<button
					onClick={toggleBan}
					className={`btn ${
						user.isBanned ? "btn-success" : "btn-danger"
					}`}
				>
					{user.isBanned ? "Restore User" : "Suspend User"}
				</button>
			</div>

			{/* ================= USAGE STATS ================= */}
			{usage && (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
					<StatsCard
						title="Data In"
						value={formatBytes(usage.totalBytesIn)}
						icon={<Download size={20} />}
					/>
					<StatsCard
						title="Data Out"
						value={formatBytes(usage.totalBytesOut)}
						icon={<Upload size={20} />}
					/>
					<StatsCard
						title="Devices"
						value={usage.devicesConnected}
						icon={<Users size={20} />}
					/>
					<StatsCard
						title="Online Time"
						value={formatTime(usage.totalTimeOnline)}
						icon={<Clock size={20} />}
					/>
				</div>
			)}

			{/* ================= CURRENT SUBSCRIPTION ================= */}
			<div className="card space-y-4">
				<h2 className="text-lg font-semibold text-primary">
					Current Subscription
				</h2>

				{subscription ? (
					<div className="flex flex-col sm:flex-row gap-6">
						<div className="flex flex-col items-center gap-2">
							<CircularProgress
								percent={subscriptionMeta.percentRemaining}
							/>
							<p className="text-xs text-muted">
								{subscriptionMeta.remainingDays} days left
							</p>
						</div>

						<div className="grid gap-2 text-sm">
							<div className="flex items-center gap-2">
								<Server size={16} />
								{subscription.plan?.planName}
							</div>
							<div className="flex items-center gap-2">
								<DollarSign size={16} />
								₦{subscription.plan?.price}
							</div>
							<div className="flex items-center gap-2">
								<Wifi size={16} />
								{subscription.plan?.speedRate} Mbps
							</div>
							<div className="flex items-center gap-2">
								<Users size={16} />
								{subscription.plan?.devicesAllowed} device(s)
							</div>
							<div className="flex items-center gap-2">
								<Calendar size={16} />
								{new Date(subscription.start).toDateString()}
								{" → "}
								{new Date(subscription.end).toDateString()}
							</div>
						</div>
					</div>
				) : (
					<p className="text-sm text-muted">
						No active subscription.
					</p>
				)}
			</div>

			{/* ================= ASSIGN SUBSCRIPTION ================= */}
			{!subscription && (
				<div className="card space-y-4">
					<h2 className="text-lg font-semibold text-primary">
						Assign Subscription
					</h2>

					{feedback && (
						<div
							className={`text-sm px-4 py-2 rounded-md ${
								feedback.type === "success"
									? "bg-green-100 text-green-700"
									: "bg-red-100 text-red-700"
							}`}
						>
							{feedback.message}
						</div>
					)}

					<div className="grid sm:grid-cols-3 gap-4">
						<select
							value={selectedPlan}
							onChange={(e) =>
								setSelectedPlan(e.target.value)
							}
							className="input"
						>
							<option value="">Select Plan</option>
							{plans.map((plan) => (
								<option key={plan._id} value={plan._id}>
									{plan.planName} – ₦{plan.price}
								</option>
							))}
						</select>

						<input
							type="date"
							value={startDate}
							onChange={(e) =>
								setStartDate(e.target.value)
							}
							className="input"
						/>

						<button
							onClick={handleAssignSubscription}
							disabled={isAssigning}
							className="btn btn-primary"
						>
							{isAssigning ? "Assigning..." : "Assign"}
						</button>
					</div>
				</div>
			)}

			{/* ================= PAYMENTS ================= */}
			<PaymentsSection payments={payments} />

		</div>
	);
};

export default AdminUserDetails;

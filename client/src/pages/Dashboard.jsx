import { Link } from "react-router-dom";
import { useUser } from "../hooks/useUser";
import { Spinner } from "../components/ui/Loader";
import StatsCard from "../components/StatsCard";
import PaymentsSection from "../components/PaymentsSection";
import StatusBadge from "../components/ui/StatusBadge";
import { Wifi, Upload, Download, Users, Server, DollarSign, Clock } from "lucide-react";
import { formatBytes, formatTime } from "../utils/formatters";

const Dashboard = () => {
	const { dashboard } = useUser();

	if (dashboard.isLoading) return <Spinner message="Loading dashboard..." />;
	if (dashboard.isError)
		return <p className="text-center text-red-500">Failed to load dashboard data.</p>;

	const { profile, subscription, usage, recentPayments } = dashboard.data;

	return (
		<div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-8">

			{/* ===================== */}
			{/* WELCOME HEADER */}
			{/* ===================== */}
			<div className="space-y-1">
				<h1 className="text-2xl sm:text-3xl font-bold text-primary">
					Welcome, {profile.firstName}
				</h1>
				<p className="text-secondary break-all">{profile.email}</p>
			</div>

			{/* ===================== */}
			{/* STATS CARDS */}
			{/* ===================== */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				<StatsCard
					title="Total Data In"
					value={formatBytes(usage.totalBytesIn)}
					icon={<Download size={22} />}
					color="bg-blue-500"
				/>
				<StatsCard
					title="Total Data Out"
					value={formatBytes(usage.totalBytesOut)}
					icon={<Upload size={22} />}
					color="bg-green-500"
				/>
				<StatsCard
					title="Devices Connected"
					value={usage.devicesConnected}
					icon={<Users size={22} />}
					color="bg-purple-500"
				/>
				<StatsCard
					title="Time Online"
					value={formatTime(usage.totalTimeOnline)}
					icon={<Clock size={22} />}
					color="bg-yellow-500"
				/>
			</div>

			{/* ===================== */}
			{/* SUBSCRIPTION STATUS */}
			{/* ===================== */}
			<div className="p-4 sm:p-6 bg-surface border rounded-xl shadow-sm">
				<div className="flex items-center justify-between mb-2">
					<h2 className="text-lg font-semibold text-primary">Subscription</h2>
					{subscription && <StatusBadge status={subscription.status} />}
				</div>

				{subscription ? (
					<div className="space-y-1 text-sm">
						<p className="font-medium">{subscription.plan.planName}</p>
						<p>₦{subscription.plan.price}</p>
						<p>
							{new Date(subscription.start).toDateString()} →{" "}
							{new Date(subscription.end).toDateString()}
						</p>
						<Link
							to="/subscriptions"
							className="text-sm text-accent font-medium inline-block mt-1"
						>
							View details →
						</Link>
					</div>
				) : (
					<div className="text-center py-4">
						<p className="text-gray-500">You do not have an active subscription.</p>
						<Link
							to="/subscriptions"
							className="inline-block mt-3 px-4 py-2 bg-primary text-white rounded-lg shadow hover:bg-primary/90 transition"
						>
							Choose a Plan
						</Link>
					</div>
				)}
			</div>

			{/* ===================== */}
			{/* PAYMENTS */}
			{/* ===================== */}
			<div className="space-y-4 overflow-x-auto">
				<h2 className="text-xl font-semibold text-primary">Recent Payments</h2>
				<PaymentsSection payments={recentPayments} />
			</div>

			{/* ===================== */}
			{/* ACTIVE SESSION */}
			{/* ===================== */}
			{usage.activeSession && (
				<div className="p-4 sm:p-6 bg-surface border rounded-xl shadow-sm overflow-x-auto">
					<h2 className="text-lg font-semibold mb-4">Active Session</h2>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm min-w-[280px]">
						<p><strong>IP:</strong> {usage.activeSession.ip}</p>
						<p><strong>MAC:</strong> {usage.activeSession.mac}</p>
						<p><strong>Uptime:</strong> {usage.activeSession.uptime}</p>
						<p><strong>Login By:</strong> {usage.activeSession.loginBy}</p>
						<p><strong>Data In:</strong> {formatBytes(usage.activeSession.bytesIn)}</p>
						<p><strong>Data Out:</strong> {formatBytes(usage.activeSession.bytesOut)}</p>
						<p>
							<strong>Started At:</strong>{" "}
							{new Date(usage.activeSession.startedAt).toLocaleString()}
						</p>
					</div>
				</div>
			)}
		</div>
	);
};

export default Dashboard;

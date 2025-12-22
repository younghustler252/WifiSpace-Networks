import { Link } from "react-router-dom";
import { useUser } from "../hooks/useUser";
import { Spinner } from "../components/ui/Loader";
import Avatar from "../components/ui/Avatar";
import StatsCard from "../components/StatsCard";
import PaymentsSection from "../components/PaymentsSection";
import {
	Wifi,
	Upload,
	Download,
	Users,
	Server,
	DollarSign,
	Clock,
} from "lucide-react";
import { formatBytes, formatTime } from "../utils/formatters";

const Dashboard = () => {
	const { dashboard } = useUser();
	if (dashboard.isLoading) {
		return <Spinner message="Loading dashboard..." />;
	}

	if (dashboard.isError) {
		return (
			<p className="text-center text-red-500">
				Failed to load dashboard data.
			</p>
		);
	}

	const { profile, subscription, usage, recentPayments } = dashboard.data;

	return (
		<div className="max-w-7xl mx-auto space-y-8">
			{/* ===================== */}
			{/* WELCOME HEADER */}
			{/* ===================== */}
			<div className="space-y-1">
				<h1 className="text-2xl sm:text-3xl font-bold text-primary">
					Welcome, {profile.firstName}
				</h1>

				<p className="text-secondary break-all">{profile.email}</p>

				{profile.wsnId && (
					<p className="text-sm text-gray-500">
						Customer ID:{" "}
						<span className="font-medium">{profile.wsnId}</span>
					</p>
				)}
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
			{/* PROFILE + SUBSCRIPTION */}
			{/* ===================== */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Profile Summary */}
				<div className="p-4 sm:p-6 bg-surface border border-surface rounded-xl shadow-sm">
					<h2 className="text-lg font-semibold text-primary mb-4">
						Profile Summary
					</h2>

					<div className="flex items-center gap-4">
						<Avatar
							firstName={profile.firstName}
							lastName={profile.lastName}
							src={profile.profilePicture}
							size={56}
						/>

						<div className="space-y-1 overflow-hidden">
							<p className="font-semibold truncate">
								{profile.fullName}
							</p>
							<p className="text-secondary truncate">
								{profile.email}
							</p>
							<p className="text-sm text-gray-500 truncate">
								Last seen:{" "}
								{profile.lastSeenAt
									? new Date(profile.lastSeenAt).toLocaleString()
									: "N/A"}
							</p>

							<span
								className={`inline-block text-xs px-2 py-1 rounded ${profile.subscriptionStatus === "active"
									? "bg-green-100 text-green-700"
									: "bg-red-100 text-red-700"
									}`}
							>
								{profile.subscriptionStatus.toUpperCase()}
							</span>
						</div>
					</div>
				</div>

				{/* Subscription */}
				<div className="p-4 sm:p-6 bg-surface border border-surface rounded-xl shadow-sm">
					<h2 className="text-lg font-semibold text-primary mb-4">
						Subscription Plan
					</h2>

					{subscription ? (
						<div className="grid gap-2 text-sm">
							<div className="flex items-center gap-2 truncate">
								<Server size={18} />
								<span className="truncate">{subscription.planName}</span>
							</div>

							<div className="flex items-center gap-2">
								<DollarSign size={18} /> ${subscription.price}
							</div>

							<div className="flex items-center gap-2">
								<Wifi size={18} /> Speed: {subscription.speedRate} Mbps
							</div>

							<div className="flex items-center gap-2">
								<Users size={18} /> Devices:{" "}
								{subscription.devicesAllowed}
							</div>

							{subscription.features?.length > 0 && (
								<p className="mt-2 break-words">
									<strong>Features:</strong>{" "}
									{subscription.features.join(", ")}
								</p>
							)}

							<p className="break-words">
								<strong>MikroTik Profile:</strong>{" "}
								{subscription.mikrotikProfile}
							</p>
						</div>
					) : (
						<div className="text-center py-4">
							<p className="text-gray-500">
								You do not have an active subscription.
							</p>

							<Link
								to="/subscriptions"
								className="inline-block mt-3 px-4 py-2 bg-primary text-white rounded-lg shadow hover:bg-primary/90 transition"
							>
								Choose a Plan
							</Link>
						</div>
					)}
				</div>
			</div>

			{/* ===================== */}
			{/* PAYMENTS */}
			{/* ===================== */}
			<PaymentsSection payments={recentPayments} />

			{/* ===================== */}
			{/* ACTIVE SESSION */}
			{/* ===================== */}
			{usage.activeSession && (
				<div className="p-4 sm:p-6 bg-surface border border-surface rounded-xl shadow-sm overflow-x-auto">
					<h2 className="text-lg font-semibold mb-4">
						Active Session
					</h2>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm min-w-[280px]">
						<p><strong>IP:</strong> {usage.activeSession.ip}</p>
						<p><strong>MAC:</strong> {usage.activeSession.mac}</p>
						<p><strong>Uptime:</strong> {usage.activeSession.uptime}</p>
						<p><strong>Login By:</strong> {usage.activeSession.loginBy}</p>
						<p><strong>Data In:</strong> {formatBytes(usage.activeSession.bytesIn)}</p>
						<p><strong>Data Out:</strong> {formatBytes(usage.activeSession.bytesOut)}</p>
						<p>
							<strong>Started At:</strong>{" "}
							{new Date(
								usage.activeSession.startedAt
							).toLocaleString()}
						</p>
					</div>
				</div>
			)}
		</div>
	);
};

export default Dashboard;

import { useAdminDashboardData } from "../../hooks/useAdmin";
import { Spinner } from "../../components/ui/Loader";
import StatsCard from "../../components/StatsCard";
import { Users, Server, DollarSign, Wifi } from "lucide-react";
import PaymentsSection from "../../components/PaymentsSection";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
	const { data, isLoading, isError } = useAdminDashboardData();
	const navigate = useNavigate();

	if (isLoading) return <Spinner message="Loading dashboard..." />;
	if (isError)
		return (
			<p className="text-danger text-center">
				Failed to load dashboard data.
			</p>
		);

	const {
		totalUsers,
		activeSubscriptions,
		totalRevenue,
		activeSessions,
		recentPayments = [],
	} = data || {};

	// Optional click handlers for cards
	const handleCardClick = (type) => {
		switch (type) {
			case "users":
				navigate("/admin/users");
				break;
			case "subscriptions":
				navigate("/subscriptions");
				break;
			case "revenue":
				// maybe open revenue report
				break;
			case "sessions":
				// maybe open active sessions view
				break;
			default:
				break;
		}
	};

	return (
		<div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-8">
			{/* ------------------------- */}
			{/*   WELCOME HEADER */}
			{/* ------------------------- */}
			<div className="space-y-1">
				<h1 className="text-3xl font-bold text-primary">Welcome, Admin</h1>
				<p className="text-secondary">System overview and quick insights</p>
			</div>

			{/* ------------------------- */}
			{/*   STATS CARDS */}
			{/* ------------------------- */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
				<StatsCard
					title="Total Users"
					value={totalUsers}
					icon={<Users size={24} />}
					color="bg-accent/10 text-accent"
					onClick={() => handleCardClick("users")}
				/>
				<StatsCard
					title="Active Subscriptions"
					value={activeSubscriptions}
					icon={<Server size={24} />}
					color="bg-success/10 text-success"
					onClick={() => handleCardClick("subscriptions")}
				/>
				<StatsCard
					title="Total Revenue"
					value={`$${totalRevenue?.toLocaleString()}`}
					icon={<DollarSign size={24} />}
					color="bg-accent/10 text-accent"
					onClick={() => handleCardClick("revenue")}
				/>
				<StatsCard
					title="Active Sessions"
					value={activeSessions}
					icon={<Wifi size={24} />}
					color="bg-accent/10 text-accent"
					onClick={() => handleCardClick("sessions")}
				/>
			</div>

			{/* ------------------------- */}
			{/*   RECENT PAYMENTS */}
			{/* ------------------------- */}
			<div className="space-y-4">
				<h2 className="text-xl font-semibold text-primary">Recent Payments</h2>
				<PaymentsSection payments={recentPayments} />
			</div>
		</div>
	);
};

export default AdminDashboard;

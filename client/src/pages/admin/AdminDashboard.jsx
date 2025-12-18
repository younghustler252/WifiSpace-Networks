import { useAdminDashboardData } from "../../hooks/useAdmin";
import { Spinner } from "../../components/ui/Loader";
import StatsCard from "../../components/StatsCard";
import { Users, Server, DollarSign, Wifi } from "lucide-react";
import { Link } from "react-router-dom";
import PaymentsSection from "../../components/PaymentsSection";

const AdminDashboard = () => {
    const { data, isLoading, isError } = useAdminDashboardData();

    if (isLoading) return <Spinner message="Loading dashboard..." />;
    if (isError)
        return <p className="text-danger text-center">Failed to load dashboard data.</p>;

    const { totalUsers, activeSubscriptions, totalRevenue, activeSessions, recentPayments = [] } = data || {};

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-8">
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
                />
                <StatsCard
                    title="Active Subscriptions"
                    value={activeSubscriptions}
                    icon={<Server size={24} />}
                    color="bg-success/10 text-success"
                />
                <StatsCard
                    title="Total Revenue"
                    value={`$${totalRevenue}`}
                    icon={<DollarSign size={24} />}
                    color="bg-accent/10 text-accent"
                />
                <StatsCard
                    title="Active Sessions"
                    value={activeSessions}
                    icon={<Wifi size={24} />}
                    color="bg-accent/10 text-accent"
                />
            </div>

            {/* ------------------------- */}
            {/*   QUICK ACTIONS */}
            {/* ------------------------- */}
            <div className="flex flex-wrap gap-4">
                <Link
                    to="/admin/users"
                    className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition"
                >
                    Manage Users
                </Link>
                <Link
                    to="/admin/subscriptions"
                    className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition"
                >
                    Manage Subscriptions
                </Link>
                <Link
                    to="/admin/users/search"
                    className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition"
                >
                    Search Users
                </Link>
            </div>

            {/* ------------------------- */}
            {/*   RECENT PAYMENTS */}
            {/* ------------------------- */}
            <PaymentsSection payments={recentPayments} />
        </div>
    );
};

export default AdminDashboard;

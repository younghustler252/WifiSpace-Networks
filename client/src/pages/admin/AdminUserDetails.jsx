import { useParams } from "react-router-dom";
import { FullScreenSpinner } from "../../components/ui/Loader";
import Avatar from "../../components/ui/Avatar";
import StatsCard from "../../components/StatsCard";
import BackButton from "../../components/ui/BackButton";

import { useUserById, useBanUser } from "../../hooks/useAdmin";

import { Wifi, Upload, Download, Users, Clock, DollarSign, Server } from "lucide-react";
import PaymentsSection from "../../components/PaymentsSection";

import { formatBytes, formatTime } from "../../utils/formatters";

const AdminUserDetails = () => {
    const { id } = useParams();
    const { data, isLoading, isError } = useUserById(id);
    const { mutate: banUser } = useBanUser();

    if (isLoading) return <FullScreenSpinner message="Loading user details..." />;
    if (isError) return <p className="text-red-500 text-center">Failed to load user details.</p>;

    const user = data.user;
    const subscription = data.subscription || null;
    const usage = data.usage || null;
    const payments = data.recentPayments || [];

    const toggleBan = () => banUser({ id: user._id, ban: !user.isBanned });

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-8">

            {/* Back Button */}
            <BackButton />

            {/* User Header */}
            <div className="p-6 bg-surface border border-surface rounded-2xl shadow-md flex flex-col sm:flex-row items-center gap-6 hover:shadow-lg transition">
                <Avatar
                    src={user?.profilePicture || null}
                    firstName={user?.firstName}
                    lastName={user?.lastName}
                    size={70}
                />
                <div className="space-y-1 flex-1">
                    <h1 className="text-2xl font-bold text-primary">{user.firstName} {user.lastName}</h1>
                    <p className="text-secondary">{user.email}</p>
                    {user.wsnId && (
                        <p className="text-sm text-muted">
                            WSN ID: <span className="font-medium">{user.wsnId}</span>
                        </p>
                    )}
                    <p className="text-sm text-muted">
                        NIN: <span className="font-medium">{user.nin || "N/A"}</span>
                    </p>
                    <p className="text-sm text-muted">
                        Address: <span className="font-medium">{user.address || "N/A"}</span>
                    </p>
                    <p className="text-sm text-muted">
                        Role: <span className="font-medium">{user.role || "N/A"}</span>
                    </p>
                    <span
                        className={`inline-block text-xs px-2 py-1 rounded-full font-semibold ${user.isBanned ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}
                    >
                        {user.isBanned ? "BANNED" : "ACTIVE"}
                    </span>
                </div>

                {/* Ban Button */}
                <button
                    onClick={toggleBan}
                    className={`px-4 py-2 rounded-lg text-white font-medium ${user.isBanned ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"} transition`}
                >
                    {user.isBanned ? "Unban User" : "Ban User"}
                </button>
            </div>

            {/* Usage Stats Cards */}
            {usage && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatsCard title="Total Data In" value={formatBytes(usage.totalBytesIn)} icon={<Download size={24} />} color="bg-blue-500" />
                    <StatsCard title="Total Data Out" value={formatBytes(usage.totalBytesOut)} icon={<Upload size={24} />} color="bg-green-500" />
                    <StatsCard title="Devices Connected" value={usage.devicesConnected} icon={<Users size={24} />} color="bg-purple-500" />
                    <StatsCard title="Total Time Online" value={formatTime(usage.totalTimeOnline)} icon={<Clock size={24} />} color="bg-yellow-500" />
                </div>
            )}

            {/* Subscription Card */}
            <div className="p-6 bg-surface border border-surface rounded-2xl shadow-md hover:shadow-lg transition">
                <h2 className="text-lg font-semibold text-primary mb-4">Subscription</h2>
                {subscription ? (
                    <div className="grid gap-3 text-primary text-sm">
                        <div className="flex items-center gap-2"><Server size={18} /> {subscription.planName}</div>
                        <div className="flex items-center gap-2"><DollarSign size={18} /> Price: ${subscription.price}</div>
                        <div className="flex items-center gap-2"><Wifi size={18} /> Speed: {subscription.speedRate}</div>
                        <div className="flex items-center gap-2"><Users size={18} /> Devices: {subscription.devicesAllowed}</div>
                        {subscription.features && <p className="mt-2"><strong>Features:</strong> {subscription.features.join(", ")}</p>}
                        <p><strong>MikroTik Profile:</strong> {subscription.mikrotikProfile}</p>
                    </div>
                ) : (
                    <p className="text-gray-500 text-sm">No active subscription.</p>
                )}
            </div>

            {/* Recent Payments Section */}
            <PaymentsSection payments={payments} />

        </div>
    );
};

export default AdminUserDetails;

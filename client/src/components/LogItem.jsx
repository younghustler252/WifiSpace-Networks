import React from "react";
import { Wifi, Users, Activity, TrendingUp } from "lucide-react";
import { useUser } from "../hooks/useUser";
import { formatBytes, formatTime } from "../utils/formatters";
import StatsCard from "../components/StatsCard";
import ProfileCard from "../components/ProfileCard";
import SubscriptionCard from "../components/SubscriptionCard";
import LogItem from "../components/LogItem";

const Dashboard = () => {
    const { userDetails = {}, subscription = {}, usage = {}, payments = {} } = useUser();

    const stats = [
        {
            title: "Active Devices",
            value: usage?.data?.activeSession?.devicesConnected ?? 0,
            Icon: Wifi,
            color: "bg-blue-500",
        },
        {
            title: "Total Data Used",
            value: formatBytes(
                (usage?.data?.totalBytesIn ?? 0) + (usage?.data?.totalBytesOut ?? 0)
            ),
            Icon: Activity,
            color: "bg-purple-500",
        },
        {
            title: "Subscription Plan",
            value: subscription?.data?.planName ?? "No Plan",
            Icon: Users,
            color: "bg-green-500",
        },
        {
            title: "Time Online",
            value: formatTime(usage?.data?.usageStats?.totalTimeOnline ?? 0),
            Icon: TrendingUp,
            color: "bg-yellow-500",
        },
    ];

    const logs = payments?.data?.map((payment) => ({
        id: payment._id,
        action: "Payment",
        detail: `${payment.method} - $${payment.amount}`,
        time: new Date(payment.createdAt).toLocaleString(),
    })) ?? [];

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Dashboard</h2>

            {userDetails?.data ? <ProfileCard user={userDetails.data} /> : <p>Loading user info...</p>}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((item, idx) => <StatsCard key={idx} {...item} />)}
            </div>

            {subscription?.data ? <SubscriptionCard subscription={subscription.data} /> : <p>Loading subscription info...</p>}

            <div className="bg-surface border border-surface rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Payments</h3>
                {logs.length === 0 ? (
                    <p className="text-gray-500">No recent payments</p>
                ) : (
                    <div className="space-y-4">
                        {logs.map((log) => <LogItem key={log.id} {...log} />)}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;

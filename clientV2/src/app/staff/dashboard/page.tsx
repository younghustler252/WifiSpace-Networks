"use client";

import { useAuth } from "@/context/AuthContext";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import { useStaffDashboard } from "@/features/dahboard/hooks/useDashboard";
import {
	Users,
	Server,
	CheckCircle,
	XCircle,
} from "lucide-react";

export default function StaffDashboardPage() {
	const { user } = useAuth();

	const { data: stats } = useStaffDashboard();

	if (!stats) {
		return (
			<div className="p-6">
				<p className="text-gray-500">Loading dashboard...</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">

			{/* ================= HEADER ================= */}
			<PageHeader
				title="Staff Dashboard"
				subtitle={`Welcome back, ${user?.firstName || "Staff"}`}
				actions={
					<span className="ui-badge ui-badge-primary">
						Staff Mode
					</span>
				}
			/>

			{/* ================= STATS ================= */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

				<StatCard
					title="Total Users"
					value={stats.users.total}
					icon={<Users size={20} />}
					description="Platform users"
				/>

				<StatCard
					title="Active Accounts"
					value={stats.accounts.active}
					icon={<Server size={20} />}
					description="Working ISP accounts"
				/>

				<StatCard
					title="Active Subscriptions"
					value={stats.subscriptions.active}
					icon={<CheckCircle size={20} />}
					description="Running subscriptions"
				/>

				<StatCard
					title="Expired Subscriptions"
					value={stats.subscriptions.expired}
					icon={<XCircle size={20} />}
					description="Needs attention"
				/>

			</div>

		</div>
	);
}
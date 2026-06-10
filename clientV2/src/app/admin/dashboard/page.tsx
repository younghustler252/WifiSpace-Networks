"use client";

import { useAuth } from "@/context/AuthContext";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import { useAdminDashboard } from "@/features/dahboard/hooks/useDashboard";
import {
	Users,
	Server,
	CheckCircle,
	XCircle,
} from "lucide-react";

export default function AdminDashboardPage() {
	const { user } = useAuth();

	const { data: stats } = useAdminDashboard();

	// fallback (important for first render)
	if (!stats) {
		return (
			<div className="p-6">
				<p className="text-gray-500">Loading dashboard...</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">

			<PageHeader
				title="Admin Dashboard"
				subtitle={`Welcome back, ${user?.firstName || "Admin"}`}
				actions={
					<span className="ui-badge ui-badge-success">
						System Online
					</span>
				}
			/>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

				<StatCard
					title="Total Users"
					value={stats.users.total}
					icon={<Users size={20} />}
					trend={12}
				/>

				<StatCard
					title="Total Accounts"
					value={stats.accounts.total}
					icon={<Server size={20} />}
					trend={5}
				/>

				<StatCard
					title="Active Subscriptions"
					value={stats.subscriptions.active}
					icon={<CheckCircle size={20} />}
					trend={8}
				/>

				<StatCard
					title="Expired Subscriptions"
					value={stats.subscriptions.expired}
					icon={<XCircle size={20} />}
					trend={-20}
				/>

			</div>

		</div>
	);
}
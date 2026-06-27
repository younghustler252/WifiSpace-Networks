"use client";

import { useAuth } from "@/context/AuthContext";
import { useStaffDashboard } from "@/features/dahboard/hooks/useDashboard";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import { Users, Server, CheckCircle, XCircle } from "lucide-react";

export default function StaffDashboardPage() {
	const { user } = useAuth();
	const { data: stats } = useStaffDashboard();

	// Fallback structures prevent UI breaks and preserve numbers during background re-fetches
	const customers = stats?.customers || { active: 0, suspended: 0 };
	const accounts = stats?.accounts || { pending: 0, active: 0, suspended: 0 };
	const subscriptions = stats?.subscriptions || { active: 0, expired: 0 };

	return (
		<div className="space-y-6">

			{/* Page Identity Header Context */}
			<PageHeader
				title="Staff Dashboard"
				subtitle={`Welcome back, ${user?.firstName || "Staff"}`}
				actions={
					<span className="ui-badge ui-badge-primary">
						Staff Mode
					</span>
				}
			/>

			{/* Operational Performance Matrix Grid */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

				<StatCard
					title="Active Customers"
					value={customers.active}
					icon={<Users size={20} />}
					description={`${customers.suspended} suspended accounts`}
				/>

				<StatCard
					title="Active Accounts"
					value={accounts.active}
					icon={<Server size={20} />}
					description={`${accounts.pending} pending activation`}
				/>

				<StatCard
					title="Active Subscriptions"
					value={subscriptions.active}
					icon={<CheckCircle size={20} />}
					description="Running hardware syncs"
				/>

				<StatCard
					title="Expired Subscriptions"
					value={subscriptions.expired}
					icon={<XCircle size={20} />}
					description="Tiers requiring renewal"
				/>

			</div>

		</div>
	);
}

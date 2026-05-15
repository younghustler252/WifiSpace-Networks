"use client";

import { useAuth } from "@/context/AuthContext";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import {
	Users,
	Server,
	CheckCircle,
	XCircle,
	Activity,
	Wifi,
} from "lucide-react";

export default function AdminDashboardPage() {

	const { user, activeAccount } = useAuth();

	// ================= DUMMY DATA =================
	const stats = {
		totalUsers: 1280,
		totalAccounts: 860,
		activeSubscriptions: 640,
		suspendedAccounts: 42,
		systemOnline: true,
	};

	return (
		<div className="space-y-6">

			{/* ================= HEADER ================= */}
			<PageHeader
				title="Admin Dashboard"
				subtitle="Monitor users, accounts, subscriptions, and system health"
				actions={
					<div className="flex items-center gap-2">

						{stats.systemOnline ? (
							<span className="ui-badge ui-badge-success flex items-center gap-2">
								
								<span className="relative flex h-2 w-2">
									<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
									<span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
								</span>

								System Online
							</span>
						) : (
							<span className="ui-badge ui-badge-danger flex items-center gap-2">
								<XCircle size={12} />
								System Offline
							</span>
						)}

					</div>
				}
			/>

			{/* ================= STATS GRID ================= */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

				<StatCard
					title="Total Users"
					value={stats.totalUsers}
					icon={<Users size={20} />}
					trend={12}
					description="Registered platform users"
				/>

				<StatCard
					title="Total Accounts"
					value={stats.totalAccounts}
					icon={<Server size={20} />}
					trend={5}
					description="All ISP accounts created"
				/>

				<StatCard
					title="Active Subscriptions"
					value={stats.activeSubscriptions}
					icon={<CheckCircle size={20} />}
					trend={8}
					description="Currently active plans"
				/>

				<StatCard
					title="Suspended Accounts"
					value={stats.suspendedAccounts}
					icon={<XCircle size={20} />}
					trend={-3}
					description="Blocked or inactive accounts"
				/>

			</div>

		</div>
	);
}
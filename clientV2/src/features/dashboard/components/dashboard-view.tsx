"use client";

import { WifiOff } from "lucide-react";
import { InfoTile } from "@/components/shared/info-tile";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { StatCard } from "@/components/shared/stat-card";
import { StatusMessage } from "@/components/shared/status-message";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatNumber } from "@/lib/format";
import { useAuthStore } from "@/stores/auth.store";
import { useDashboard } from "../hooks/use-dashboard";

export function DashboardView() {
	const role = useAuthStore((s) => s.user?.role);
	const { data, isLoading, isError, refetch } = useDashboard(role);

	if (isLoading) {
		return (
			<div className="space-y-6">
				<Skeleton className="h-12 w-64 rounded-lg" />
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					<Skeleton className="h-36 rounded-xl sm:col-span-2" />
					<Skeleton className="h-36 rounded-xl" />
					<Skeleton className="h-36 rounded-xl" />
				</div>
			</div>
		);
	}

	if (isError || !data) {
		return (
			<StatusMessage icon={WifiOff} tone="warning" title="We couldn't load the dashboard" text="Check your connection and try again.">
				<Button size="lg" className="w-full" onClick={() => refetch()}>
					Try again
				</Button>
			</StatusMessage>
		);
	}

	const { accounts, users, revenue } = data;

	return (
		<div className="space-y-6">
			<PageHeader title="Dashboard" description="What needs attention across WifiSpace." />

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<StatCard
					className="sm:col-span-2"
					highlight={(data.pendingApprovals ?? 0) > 0}
					label="Pending approvals"
					value={formatNumber(data.pendingApprovals ?? 0)}
					hint="Installation requests waiting for review"
					href="/admin/approvals"
					linkLabel="Review queue"
				/>
				<StatCard
					label="Accounts"
					value={formatNumber(accounts?.total ?? 0)}
					hint={accounts ? `${formatNumber(accounts.pppoe)} home · ${formatNumber(accounts.hotspot)} hotspot` : undefined}
					href="/admin/accounts"
					linkLabel="All accounts"
				/>
				<StatCard label="Active subscriptions" value={formatNumber(data.activeSubscriptions ?? 0)} hint="Currently online" href="/admin/subscriptions" linkLabel="View subscriptions" />
			</div>

			{accounts && (
				<SectionCard title="Accounts breakdown">
					<div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
						<InfoTile label="Home (PPPoE)" value={formatNumber(accounts.pppoe)} />
						<InfoTile label="Hotspot" value={formatNumber(accounts.hotspot)} />
						<InfoTile label="Personal" value={formatNumber(accounts.personal)} />
						<InfoTile label="Business" value={formatNumber(accounts.business)} />
						<InfoTile label="Approved" value={formatNumber(accounts.approved)} />
						<InfoTile label="Rejected" value={formatNumber(accounts.rejected)} />
					</div>
				</SectionCard>
			)}

			{(revenue || users) && (
				<SectionCard title="Business" description="Visible to superadmins only.">
					<div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
						{revenue && <InfoTile label="Total revenue" value={formatCurrency(revenue.total)} />}
						{revenue && <InfoTile label="This month" value={formatCurrency(revenue.thisMonth)} />}
						{data.successfulPayments !== undefined && (
							<InfoTile label="Successful payments" value={formatNumber(data.successfulPayments)} />
						)}
						{users && <InfoTile label="Users" value={formatNumber(users.total)} />}
						{users && <InfoTile label="Customers" value={formatNumber(users.customers)} />}
					</div>
				</SectionCard>
			)}
		</div>
	);
}
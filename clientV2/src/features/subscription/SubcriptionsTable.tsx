"use client";

import { useState, useEffect } from "react";
import { Search, MoreVertical, Plus } from "lucide-react";

import Button from "@/components/ui/Button";
import Avatar from "@/components/ui/Avatar";
import Dropdown, { DropdownItem, DropdownDivider } from "@/components/ui/Dropdown";
import { SubscriptionStatus, MikrotikSyncStatus } from "./subscription.types";

import {
	Table,
	TableHeader,
	TableBody,
	TableRow,
	TableHead,
	TableCell,
} from "@/components/ui/Table";

import AdminTableLayout from "@/components/layout/AdminTableLayout";
import { MobileDataCard } from "@/components/ui/MobileDataCard";

import { useAdminSubscriptions } from "./hooks/useAdminSubscription";
import { useAuth } from "@/context/AuthContext";

interface Props {
	scope: "admin" | "staff";
}

export default function SubscriptionsTable({ scope }: Props) {
	const { user: currentUser } = useAuth();

	const isStaff = currentUser?.role === "staff";
	const isSuperAdmin = currentUser?.role === "superadmin";

	// ================= STATE =================
	const [search, setSearch] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");

	const [status, setStatus] = useState<SubscriptionStatus | undefined>(undefined);
	const [autoRenew, setAutoRenew] = useState("");
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);

	const [selected, setSelected] = useState<any | null>(null);

	// ================= DEBOUNCE =================
	useEffect(() => {
		const t = setTimeout(() => setDebouncedSearch(search), 400);
		return () => clearTimeout(t);
	}, [search]);

	useEffect(() => {
		setPage(1);
	}, [debouncedSearch, status, autoRenew]);

	// ================= QUERY =================
	const query = useAdminSubscriptions({
		search: debouncedSearch,
		status: status || undefined,
		autoRenewEnabled:
			autoRenew === ""
				? undefined
				: autoRenew === "true",
		page,
		limit,
	});

	console.log("query", query)

	const subscriptions = query.data?.data?.data ?? [];

	const total = query.data?.data?.meta?.total ?? 0;

	const totalPages = Math.ceil(total / limit);

	// ================= TOOLBAR =================
	const primary = (
		<div className="relative w-full md:w-72">
			<Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
			<input
				value={search}
				onChange={(e) => setSearch(e.target.value)}
				placeholder="Search subscriptions..."
				className="ui-input pl-10 w-full"
			/>
		</div>
	);

	const secondary = (
		<>
			<select
				className="ui-input"
				value={status}
				onChange={(e) => {
					const value = e.target.value;

					setStatus(
						value === "" ? undefined : (value as SubscriptionStatus)
					);
				}}
							>
				<option value="">All Status</option>
				<option value="active">Active</option>
				<option value="pending">Pending</option>
				<option value="expired">Expired</option>
				<option value="suspended">Suspended</option>
			</select>

			<select
				className="ui-input"
				value={autoRenew}
				onChange={(e) => setAutoRenew(e.target.value)}
			>
				<option value="">Auto Renew</option>
				<option value="true">Enabled</option>
				<option value="false">Disabled</option>
			</select>

			<select
				className="ui-input"
				value={limit}
				onChange={(e) => {
					setLimit(Number(e.target.value));
					setPage(1);
				}}
			>
				<option value={10}>10</option>
				<option value={20}>20</option>
				<option value={50}>50</option>
			</select>
		</>
	);

	const actions = (
		<Button variant="accent">
			<Plus className="w-4 h-4 mr-2" />
			New Subscription
		</Button>
	);

	// ================= RENDER =================
	return (
		<AdminTableLayout
			title={scope === "admin" ? "Subscriptions" : "Customer Subscriptions"}
			primary={primary}
			secondary={secondary}
			actions={actions}
			loading={query.isLoading}
			fetching={query.isFetching}
			isEmpty={subscriptions.length === 0}
			emptyText="No subscriptions found"
			page={page}
			totalPages={totalPages}
			limit={limit}
			onPageChange={setPage}
			onLimitChange={setLimit}
			table={
				<Table>
					<TableHeader>
						<tr>
							<TableHead>Account</TableHead>
							<TableHead>Plan</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Expires</TableHead>
							<TableHead>Auto Renew</TableHead>
							<TableHead>Actions</TableHead>
						</tr>
					</TableHeader>

					<TableBody>
						{subscriptions.map((s: any) => (
							<TableRow
								key={s.id}
								onClick={() => setSelected(s)}
							>
								{/* ACCOUNT */}
								<TableCell>
									<div className="flex items-center gap-3">
										<Avatar name={s.accountId?.wsnId || "Account"} />
										<div>
											<p>{s.accountId?.wsnId || "-"}</p>
											<p className="text-xs text-muted-foreground">
												{s.userId?.email || "-"}
											</p>
										</div>
									</div>
								</TableCell>

								{/* PLAN */}
								<TableCell>
									<div>
										<p>{s.planId?.name || "-"}</p>
										<p className="text-xs text-muted-foreground">
											₦{s.planId?.price || 0}
										</p>
									</div>
								</TableCell>

								{/* STATUS */}
								<TableCell>
									<span className="ui-badge">{s.status}</span>
								</TableCell>

								{/* EXPIRY DATE */}
								<TableCell>
									{s.expiresAt
										? new Date(s.expiresAt).toLocaleDateString()
										: "-"}
								</TableCell>

								{/* AUTO RENEW */}
								<TableCell>
									{String(s.autoRenewEnabled)}
								</TableCell>

								{/* ACTIONS */}
								<TableCell>
									<div onClick={(e) => e.stopPropagation()}>
										<Dropdown trigger={<button><MoreVertical /></button>}>
											<DropdownItem onClick={() => setSelected(s)}>
												View
											</DropdownItem>

											{isSuperAdmin && (
												<>
													<DropdownDivider />
													<DropdownItem danger>
														Terminate
													</DropdownItem>
												</>
											)}
										</Dropdown>
									</div>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			}
			mobile={
				<div className="ui-stack">
					{subscriptions.map((s: any) => (
						<MobileDataCard
							key={s.id}
							title={s.accountId?.wsnId || "Account"}
							subtitle={s.userId?.email || s.planId?.name || "-"}
							badge={<span className="ui-badge">{s.status}</span>}
							fields={[
								{ label: "Plan", value: s.planId?.name || "-" },
								{ label: "Price", value: `₦${s.planId?.price || 0}` },
								{
									label: "Expires",
									value: s.expiresAt
										? new Date(s.expiresAt).toLocaleDateString()
										: "-",
								},
								{
									label: "Auto Renew",
									value: String(s.autoRenewEnabled),
								},
							]}
							onClick={() => setSelected(s)}
						/>

					))}
				</div>
			}
		/>
	);
}
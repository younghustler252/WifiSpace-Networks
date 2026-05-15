"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { Search, MoreVertical } from "lucide-react";

import { accountApi } from "@/lib/api/account";

import Avatar from "@/components/ui/Avatar";

import Dropdown, {
	DropdownItem,
	DropdownDivider,
} from "@/components/ui/Dropdown";

import {
	Table,
	TableHeader,
	TableBody,
	TableRow,
	TableHead,
	TableCell,
} from "@/components/ui/Table";

import { MobileDataCard } from "@/components/ui/MobileDataCard";
import AdminTableLayout from "@/components/layout/AdminTableLayout";

export default function AdminAccountsPage() {
	// ================= STATE =================
	const [search, setSearch] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");

	const [accountType, setAccountType] = useState("");
	const [serviceType, setServiceType] = useState("");
	const [profileStatus, setProfileStatus] = useState("");

	const [sort, setSort] = useState("wsnid_desc");

	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);

	// ================= DEBOUNCE =================
	useEffect(() => {
		const t = setTimeout(() => setDebouncedSearch(search), 400);
		return () => clearTimeout(t);
	}, [search]);

	useEffect(() => {
		setPage(1);
	}, [debouncedSearch, accountType, serviceType, profileStatus, sort]);

	// ================= QUERY =================
	const { data, isLoading, isFetching, error } = useQuery({
		queryKey: [
			"admin-accounts",
			debouncedSearch,
			accountType,
			serviceType,
			profileStatus,
			sort,
			page,
			limit,
		],
		queryFn: () =>
			accountApi.getAllAccounts({
				search: debouncedSearch || undefined,
				accountType: accountType || undefined,
				serviceType: serviceType || undefined,
				profileStatus: profileStatus || undefined,
				sort,
				skip: (page - 1) * limit,
				limit,
			}),
		keepPreviousData: true,
	});
	const response = data;
	const accounts = response?.data || [];
	console.log("accounts", accounts)
	const total = response?.total || 0;
	const totalPages = Math.ceil(total / limit);

	if (error) {
		return (
			<div className="p-6 text-danger text-center">
				Failed to load accounts
			</div>
		);
	}

	// ================= SAFE USER FORMATTER =================
	const resolveUser = (user: any) => {
		if (!user) return null;

		return {
			name: `${user.firstName} ${user.lastName}`,
			email: user.email,
			avatar: user?.avatar?.url || null,
		};
	};

	// ================= TOOLBAR =================
	const primary = (
		<div className="relative w-full md:w-72">
			<Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
			<input
				value={search}
				onChange={(e) => setSearch(e.target.value)}
				placeholder="Search accounts..."
				className="ui-input pl-10 w-full"
			/>
		</div>
	);

	const secondary = (
		<>
			<select className="ui-input" value={accountType} onChange={(e) => setAccountType(e.target.value)}>
				<option value="">All Types</option>
				<option value="personal">Personal</option>
				<option value="business">Business</option>
			</select>

			<select className="ui-input" value={serviceType} onChange={(e) => setServiceType(e.target.value)}>
				<option value="">All Services</option>
				<option value="pppoe">PPPoE</option>
				<option value="hotspot">Hotspot</option>
			</select>

			<select className="ui-input" value={profileStatus} onChange={(e) => setProfileStatus(e.target.value)}>
				<option value="">All Status</option>
				<option value="pending">Pending</option>
				<option value="active">Active</option>
				<option value="suspended">Suspended</option>
				<option value="canceled">Canceled</option>
			</select>

			<select className="ui-input" value={sort} onChange={(e) => setSort(e.target.value)}>
				<option value="wsnid_desc">WSNID ↓</option>
				<option value="wsnid_asc">WSNID ↑</option>
				<option value="newest">Newest</option>
				<option value="oldest">Oldest</option>
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

	// ================= RENDER =================
	return (
		<AdminTableLayout
			title="Manage Accounts"
			primary={primary}
			secondary={secondary}
			loading={isLoading}
			fetching={isFetching}
			isEmpty={accounts.length === 0}
			emptyText="No accounts found"
			page={page}
			totalPages={totalPages}
			limit={limit}
			onPageChange={setPage}
			onLimitChange={setLimit}

			// 📱 MOBILE
			mobile={
				<div className="ui-stack">
					{accounts.map((a: any) => {
						const user = resolveUser(a.user || a.userId);

						return (
							<MobileDataCard
								key={a.id || a._id}
								title={`${a.accountType} • ${a.serviceType}`}
								subtitle={a.wsnId}
								badge={<span className="ui-badge">{a.profileStatus}</span>}
								fields={[
									{ label: "WSNID", value: a.wsnId },
									{
										label: "User",
										value: user
											? `${user.name} • ${user.email}`
											: "Unknown",
									},
								]}
							/>
						);
					})}
				</div>
			}

			// 🖥 DESKTOP
			table={
				<div className="ui-card p-0 overflow-hidden">
					<Table>
						<TableHeader>
							<tr>
								<TableHead>WSNID</TableHead>
								<TableHead>Type</TableHead>
								<TableHead>Service</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>User</TableHead>
								<TableHead>Actions</TableHead>
							</tr>
						</TableHeader>

						<TableBody>
							{accounts.map((a: any) => {
								const user = resolveUser(a.user || a.userId);

								return (
									<TableRow key={a.id || a._id}>
										<TableCell>{a.wsnId}</TableCell>
										<TableCell>{a.accountType}</TableCell>
										<TableCell>{a.serviceType}</TableCell>

										<TableCell>
											<span className="ui-badge">
												{a.profileStatus}
											</span>
										</TableCell>

										<TableCell>
											{user ? (
												<div className="flex items-center gap-2">
													<Avatar
														name={user.name}
														src={user.avatar}
													/>

													<div className="flex flex-col">
														<span className="font-medium">
															{user.name}
														</span>
														<span className="text-xs text-muted-foreground">
															{user.email}
														</span>
													</div>
												</div>
											) : (
												<span className="text-muted-foreground">
													Unknown user
												</span>
											)}
										</TableCell>

										<TableCell>
											<Dropdown trigger={<button><MoreVertical /></button>}>
												<DropdownItem>View</DropdownItem>
												<DropdownDivider />
												<DropdownItem>Edit</DropdownItem>
											</Dropdown>
										</TableCell>
									</TableRow>
								);
							})}
						</TableBody>
					</Table>
				</div>
			}
		/>
	);
}
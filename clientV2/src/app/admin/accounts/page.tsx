"use client";

import { useEffect, useState } from "react";
import {
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	Filter,
	Search,
	Users,
	BriefcaseBusiness,
	Globe,
	Activity,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/Table";

import {
	useAdminAccounts,
	useAdminAccountStats,
} from "@/features/account/hooks/useAdminAccount";

import type {
	Account,
	AccountType,
	ApprovalStatus,
	ServiceType,
	GetAllAccountsParams,
} from "@/features/account/api/account.types";

type SortOption =
	| "wsnid_desc"
	| "wsnid_asc"
	| "newest"
	| "oldest";

export default function Page() {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	// ======================================
	// URL STATE
	// ======================================

	const [search, setSearch] = useState(
		searchParams.get("search") ?? ""
	);

	const [debouncedSearch, setDebouncedSearch] = useState(
		searchParams.get("search") ?? ""
	);

	const [accountType, setAccountType] = useState<"" | AccountType>(
		(searchParams.get("accountType") as AccountType) ?? ""
	);

	const [serviceType, setServiceType] = useState<"" | ServiceType>(
		(searchParams.get("serviceType") as ServiceType) ?? ""
	);

	const [approvalStatus, setApprovalStatus] = useState<
		"" | ApprovalStatus
	>(
		(searchParams.get("approvalStatus") as ApprovalStatus) ?? ""
	);

	const [sort, setSort] = useState<SortOption>(
		(searchParams.get("sort") as SortOption) ?? "wsnid_desc"
	);

	const [page, setPage] = useState(
		Math.max(1, Number(searchParams.get("page") ?? 1))
	);

	const [limit, setLimit] = useState(
		Number(searchParams.get("limit") ?? 10)
	);

	// ======================================
	// SEARCH
	// ======================================

	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearch(search);
		}, 400);

		return () => clearTimeout(timer);
	}, [search]);

	// ======================================
	// RESET PAGE
	// ======================================

	useEffect(() => {
		setPage(1);
	}, [
		debouncedSearch,
		accountType,
		serviceType,
		approvalStatus,
		sort,
	]);

	// ======================================
	// URL SYNC
	// ======================================

	useEffect(() => {
	const params = new URLSearchParams(searchParams.toString());

	const setOrDelete = (key: string, value?: string) => {
		if (value) {
			params.set(key, value);
		} else {
			params.delete(key);
		}
	};

	setOrDelete("search", debouncedSearch || undefined);
	setOrDelete("accountType", accountType || undefined);
	setOrDelete("serviceType", serviceType || undefined);
	setOrDelete("approvalStatus", approvalStatus || undefined);

	setOrDelete(
		"sort",
		sort !== "wsnid_desc" ? sort : undefined
	);

	setOrDelete(
		"page",
		page !== 1 ? String(page) : undefined
	);

	setOrDelete(
		"limit",
		limit !== 10 ? String(limit) : undefined
	);

	const query = params.toString();
	const nextUrl = query ? `${pathname}?${query}` : pathname;

	// IMPORTANT: don't navigate if the URL hasn't actually changed
	const currentUrl = searchParams.toString()
		? `${pathname}?${searchParams.toString()}`
		: pathname;

	if (nextUrl !== currentUrl) {
		router.replace(nextUrl, { scroll: false });
	}
}, [
	debouncedSearch,
	accountType,
	serviceType,
	approvalStatus,
	sort,
	page,
	limit,
	pathname,
	router,
	searchParams,
]);

	// ======================================
	// STATS
	// ======================================

	const {
		data: stats,
		isLoading: statsLoading,
	} = useAdminAccountStats();

	// ======================================
	// ACCOUNTS
	// ======================================

	const accountParams: GetAllAccountsParams = {
		search: debouncedSearch || undefined,
		accountType: accountType || undefined,
		serviceType: serviceType || undefined,
		approvalStatus: approvalStatus || undefined,
		sort,
		page,
		limit,
	};

	const {
		data: accountsResponse,
		isLoading: accountsLoading,
		isFetching: accountsFetching,
	} = useAdminAccounts(accountParams);

	const accounts = accountsResponse?.data ?? [];
	const meta = accountsResponse?.meta;

	const total = meta?.total ?? 0;
	const totalPages = meta?.totalPages ?? 1;

	// ======================================
	// HELPERS
	// ======================================

	const formatDate = (value?: string | null) => {
		if (!value) return "—";

		return new Date(value).toLocaleDateString("en-NG", {
			day: "2-digit",
			month: "short",
			year: "numeric",
		});
	};

	const getAccountName = (account: Account) => {
		if (account.user) {
			return `${account.user.firstName} ${account.user.lastName}`;
		}

		return account.businessName || "Unknown user";
	};

	const getStatusClasses = (status: ApprovalStatus) => {
		switch (status) {
			case "approved":
				return "bg-success/10 text-success";
			case "pending":
				return "bg-warning/10 text-warning";
			case "rejected":
				return "bg-danger/10 text-danger";
			default:
				return "bg-muted text-muted-foreground";
		}
	};

	const getStatusLabel = (status: ApprovalStatus) => {
		switch (status) {
			case "approved":
				return "Approved";
			case "pending":
				return "Pending";
			case "rejected":
				return "Rejected";
			default:
				return status;
		}
	};

	const handleRowClick = (accountId: string) => {
		router.push(`${pathname}/${accountId}`);
	};

	// ======================================
	// QUICK FILTERS
	// ======================================

	const quickFilters = [
		{
			label: "All",
			active: !accountType && !serviceType,
			onClick: () => {
				setAccountType("");
				setServiceType("");
			},
		},
		{
			label: "Personal",
			active: accountType === "personal",
			onClick: () => {
				setAccountType("personal");
				setServiceType("");
			},
		},
		{
			label: "Business",
			active: accountType === "business",
			onClick: () => {
				setAccountType("business");
				setServiceType("");
			},
		},
		{
			label: "PPPoE",
			active: serviceType === "pppoe",
			onClick: () => {
				setServiceType("pppoe");
				setAccountType("");
			},
		},
		{
			label: "Hotspot",
			active: serviceType === "hotspot",
			onClick: () => {
				setServiceType("hotspot");
				setAccountType("");
			},
		},
	];

	// ======================================
	// RENDER
	// ======================================

	return (
		<div className="w-full">
			<PageHeader
				title="Manage Accounts"
				subtitle="View, manage and monitor all customer accounts."
			/>

			<div className="px-6 pb-8 space-y-6">
				{/* Stats */}

				<section>
					<div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
						<StatCard
							title="Personal"
							value={statsLoading ? "—" : stats?.personal ?? 0}
							icon={<Users className="w-5 h-5" />}
						/>

						<StatCard
							title="Business"
							value={statsLoading ? "—" : stats?.business ?? 0}
							icon={<BriefcaseBusiness className="w-5 h-5" />}
						/>

						<StatCard
							title="PPPoE"
							value={statsLoading ? "—" : stats?.pppoe ?? 0}
							icon={<Globe className="w-5 h-5" />}
						/>

						<StatCard
							title="Hotspot"
							value={statsLoading ? "—" : stats?.hotspot ?? 0}
							icon={<Activity className="w-5 h-5" />}
						/>
					</div>
				</section>

				{/* Filters */}

				<section>
					<div className="flex flex-col gap-3 p-3 border rounded-lg border-border lg:flex-row lg:items-center">
						<div className="relative flex-1 min-w-[220px]">
							<Search className="absolute w-4 h-4 -translate-y-1/2 left-2.5 top-1/2 text-muted-foreground" />

							<input
								value={search}
								onChange={(event) =>
									setSearch(event.target.value)
								}
								placeholder="Search by name, email, WSN ID…"
								className="w-full h-9 ui-input pl-9"
							/>
						</div>

						<div className="flex flex-wrap items-center gap-2">
							{quickFilters.map((filter) => (
								<button
									key={filter.label}
									type="button"
									onClick={filter.onClick}
									className={`px-2.5 py-1.5 rounded-md border text-[12px] transition-colors ${
										filter.active
											? "border-signal/40 text-signal bg-signal/10"
											: "border-border text-muted-foreground hover:text-foreground hover:bg-muted"
									}`}
								>
									{filter.label}
								</button>
							))}
						</div>

						<details className="relative">
							<summary className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm cursor-pointer list-none rounded-md text-muted-foreground hover:text-foreground hover:bg-muted">
								<Filter className="w-3.5 h-3.5" />
								More filters
								<ChevronDown className="w-3.5 h-3.5" />
							</summary>

							<div className="absolute right-0 z-20 w-64 p-4 mt-2 space-y-4 border rounded-lg shadow-lg bg-background border-border">
								<div>
									<label className="block mb-2 text-xs font-semibold">
										Status
									</label>

									<select
										value={approvalStatus}
										onChange={(event) => {
											setApprovalStatus(
												event.target.value as
													| ""
													| ApprovalStatus
											);
											setPage(1);
										}}
										className="w-full h-9 ui-input"
									>
										<option value="">
											All statuses
										</option>
										<option value="pending">
											Pending
										</option>
										<option value="approved">
											Approved
										</option>
										<option value="rejected">
											Rejected
										</option>
									</select>
								</div>

								<div>
									<label className="block mb-2 text-xs font-semibold">
										Sort
									</label>

									<select
										value={sort}
										onChange={(event) => {
											setSort(
												event.target.value as SortOption
											);
											setPage(1);
										}}
										className="w-full h-9 ui-input"
									>
										<option value="wsnid_desc">
											WSNID ↓
										</option>
										<option value="wsnid_asc">
											WSNID ↑
										</option>
										<option value="newest">
											Newest
										</option>
										<option value="oldest">
											Oldest
										</option>
									</select>
								</div>

								<div>
									<label className="block mb-2 text-xs font-semibold">
										Rows per page
									</label>

									<select
										value={limit}
										onChange={(event) => {
											setLimit(
												Number(event.target.value)
											);
											setPage(1);
										}}
										className="w-full h-9 ui-input"
									>
										<option value={10}>10</option>
										<option value={20}>20</option>
										<option value={50}>50</option>
										<option value={100}>100</option>
									</select>
								</div>

								<button
									type="button"
									onClick={() => {
										setApprovalStatus("");
										setSort("wsnid_desc");
										setLimit(10);
										setPage(1);
									}}
									className="w-full h-8 text-xs border rounded-md border-border text-muted-foreground hover:bg-muted hover:text-foreground"
								>
									Reset filters
								</button>
							</div>
						</details>
					</div>
				</section>

				{/* Table */}

				<section className="relative">
					{accountsFetching && !accountsLoading && (
						<div className="absolute z-10 text-xs right-3 top-3 text-muted-foreground">
							Updating...
						</div>
					)}

					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>WSN ID</TableHead>
								<TableHead>Customer</TableHead>
								<TableHead>Type</TableHead>
								<TableHead>Service</TableHead>
								<TableHead>Router</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Created</TableHead>
							</TableRow>
						</TableHeader>

						<TableBody>
							{accountsLoading ? (
								Array.from({ length: 6 }).map((_, index) => (
									<TableRow key={`loading-${index}`}>
										<TableCell colSpan={7}>
											<div className="w-full h-5 rounded bg-muted animate-pulse" />
										</TableCell>
									</TableRow>
								))
							) : accounts.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={7}
										className="py-12 text-center text-muted-foreground"
									>
										No accounts found.
									</TableCell>
								</TableRow>
							) : (
								accounts.map((account) => (
									<TableRow
										key={account.id}
										onClick={() =>
											handleRowClick(account.id)
										}
										className="cursor-pointer"
									>
										<TableCell>
											<span className="font-semibold">
												{account.wsnId}
											</span>
										</TableCell>

										<TableCell>
											<div className="flex flex-col">
												<span className="font-medium">
													{getAccountName(account)}
												</span>

												{account.user?.email && (
													<span className="text-xs text-muted-foreground">
														{account.user.email}
													</span>
												)}
											</div>
										</TableCell>

										<TableCell>
											<span className="capitalize">
												{account.accountType}
											</span>
										</TableCell>

										<TableCell>
											<span className="uppercase">
												{account.serviceType}
											</span>
										</TableCell>

										<TableCell>
											<span>
												{account.routerId
													? account.routerProfile
													: "Unassigned"}
											</span>
										</TableCell>

										<TableCell>
											<span
												className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
													account.approvalStatus
												)}`}
											>
												{getStatusLabel(
													account.approvalStatus
												)}
											</span>
										</TableCell>

										<TableCell>
											{formatDate(account.createdAt)}
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</section>

				{/* Pagination */}

				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<p className="text-sm text-muted-foreground">
						{total === 0
							? "No accounts"
							: `Page ${page} of ${totalPages} · ${total} account${
									total === 1 ? "" : "s"
							  }`}
					</p>

					<div className="flex items-center gap-2">
						<button
							type="button"
							disabled={page <= 1 || accountsLoading}
							onClick={() =>
								setPage((current) =>
									Math.max(1, current - 1)
								)
							}
							className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium border rounded-lg border-border hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
						>
							<ChevronLeft className="w-4 h-4" />
							Previous
						</button>

						<button
							type="button"
							disabled={
								page >= totalPages ||
								accountsLoading ||
								total === 0
							}
							onClick={() =>
								setPage((current) =>
									Math.min(totalPages, current + 1)
								)
							}
							className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium border rounded-lg border-border hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
						>
							Next
							<ChevronRight className="w-4 h-4" />
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
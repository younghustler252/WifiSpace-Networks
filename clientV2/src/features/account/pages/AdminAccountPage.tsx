"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery, keepPreviousData } from "@tanstack/react-query";

import { accountApi } from "@/lib/api/account";
import AdminTableLayout from "@/components/layout/AdminTableLayout";

import AccountsTable from "../sections/AccountTable";
import AccountsMobileList from "../sections/AccountMobileList";

export default function AdminAccountsPage() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const pathname = usePathname();

	const [search, setSearch] = useState(searchParams.get("search") ?? "");

	const [accountType, setAccountType] = useState<
		"" | "personal" | "business"
	>((searchParams.get("type") as any) ?? "");

	const [serviceType, setServiceType] = useState<
		"" | "pppoe" | "hotspot"
	>((searchParams.get("service") as any) ?? "");

	const [profileStatus, setProfileStatus] = useState<
		"" | "pending" | "active" | "suspended" | "canceled"
	>((searchParams.get("status") as any) ?? "");

	const [sort, setSort] = useState<
		"wsnid_desc" | "wsnid_asc" | "newest" | "oldest"
	>((searchParams.get("sort") as any) ?? "wsnid_desc");

	const [page, setPage] = useState(
		Number(searchParams.get("page") ?? 1)
	);

	const [limit, setLimit] = useState(
		Number(searchParams.get("limit") ?? 10)
	);
	
	const [debouncedSearch, setDebouncedSearch] = useState("");

	useEffect(() => {
		const params = new URLSearchParams(searchParams.toString());

		// search
		if (debouncedSearch) params.set("search", debouncedSearch);
		else params.delete("search");

		// filters
		if (accountType) params.set("type", accountType);
		else params.delete("type");

		if (serviceType) params.set("service", serviceType);
		else params.delete("service");

		if (profileStatus) params.set("status", profileStatus);
		else params.delete("status");

		// sort
		if (sort !== "wsnid_desc") params.set("sort", sort);
		else params.delete("sort");

		// pagination
		if (page !== 1) params.set("page", String(page));
		else params.delete("page");

		if (limit !== 10) params.set("limit", String(limit));
		else params.delete("limit");

		router.replace(`${pathname}?${params.toString()}`, {
			scroll: false,
		});
	}, [
		debouncedSearch,
		accountType,
		serviceType,
		profileStatus,
		sort,
		page,
		limit,
	]);

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

		placeholderData: keepPreviousData,

		staleTime: 30_000,
		refetchOnWindowFocus: true,
		refetchOnReconnect: true,
	});
    console.log(data)
	const accounts = data?.data ?? [];
	const total = data?.total ?? 0;
	const totalPages = Math.ceil(total / limit);

	if (error) {
		return (
			<div className="p-6 text-danger text-center">
				Failed to load accounts
			</div>
		);
	}

	// ================= RENDER =================
	return (
		<AdminTableLayout
			title="Manage Accounts"

			primary={
				<div className="relative w-full md:w-72">
					<input
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Search accounts..."
						className="ui-input w-full"
					/>
				</div>
			}

			secondary={
				<>
					<select
						className="ui-input"
						value={accountType}
						onChange={(e) =>
							setAccountType(
								e.target.value as "" | "personal" | "business"
							)
						}
					>
						<option value="">All Types</option>
						<option value="personal">Personal</option>
						<option value="business">Business</option>
					</select>

					<select
						className="ui-input"
						value={serviceType}
						onChange={(e) =>
							setServiceType(
								e.target.value as "" | "pppoe" | "hotspot"
							)
						}
					>
						<option value="">All Services</option>
						<option value="pppoe">PPPoE</option>
						<option value="hotspot">Hotspot</option>
					</select>

					<select
						className="ui-input"
						value={profileStatus}
						onChange={(e) =>
							setProfileStatus(
								e.target.value as
									| ""
									| "pending"
									| "active"
									| "suspended"
									| "canceled"
							)
						}
					>
						<option value="">All Status</option>
						<option value="pending">Pending</option>
						<option value="active">Active</option>
						<option value="suspended">Suspended</option>
						<option value="canceled">Canceled</option>
					</select>

					<select
						className="ui-input"
						value={sort}
						onChange={(e) =>
							setSort(
								e.target.value as
									| "wsnid_desc"
									| "wsnid_asc"
									| "newest"
									| "oldest"
							)
						}
					>
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
			}

			loading={isLoading}
			fetching={isFetching}
			isEmpty={accounts.length === 0}
			page={page}
			totalPages={totalPages}
			limit={limit}
			onPageChange={setPage}
			onLimitChange={setLimit}

			mobile={
				<AccountsMobileList
					accounts={accounts}
					router={router}
				/>
			}

			table={
				<AccountsTable
					accounts={accounts}
					router={router}
				/>
			}
		/>
	);
}
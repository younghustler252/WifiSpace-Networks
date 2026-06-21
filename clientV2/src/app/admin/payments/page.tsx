"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { MoreVertical, Search } from "lucide-react";

import AdminTableLayout from "@/components/layout/AdminTableLayout";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/Table";

import { MobileDataCard } from "@/components/ui/MobileDataCard";

import Dropdown, {
	DropdownDivider,
	DropdownItem,
} from "@/components/ui/Dropdown";

import Button from "@/components/ui/Button";

import PaymentDetailsDrawer from "@/features/payment/paymentDetailsDrawer";

import {
	paymentApi,
	Payment,
	PaymentStatus,
} from "@/lib/api/payment";

// ===================== HELPERS =====================

const formatDate = (date: string) => {
	const d = new Date(date);

	return d.toLocaleDateString("en-GB", {
		day: "numeric",
		month: "short",
		year: "numeric",
	});
};

const formatRef = (ref?: string) => {
	if (!ref) return "—";
	if (ref.length <= 10) return ref;
	return `${ref.slice(0, 6)}...${ref.slice(-4)}`;
};

export default function AdminPaymentsPage() {
	const router = useRouter();
	const searchParams = useSearchParams();

	// ===================== STATE (SYNCED) =====================
	const [search, setSearch] = useState(
		searchParams.get("search") || ""
	);

	const [debouncedSearch, setDebouncedSearch] =
		useState(search);

	const [status, setStatus] = useState(
		searchParams.get("status") || ""
	);

	const [businessProcessed, setBusinessProcessed] =
		useState(searchParams.get("businessProcessed") || "");

	const [fromDate, setFromDate] = useState(
		searchParams.get("fromDate") || ""
	);

	const [toDate, setToDate] = useState(
		searchParams.get("toDate") || ""
	);

	const [sort, setSort] = useState<
		"newest" | "oldest" | "amount_desc" | "amount_asc"
	>("newest");

	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);

	const [selectedPaymentId, setSelectedPaymentId] =
		useState<string | null>(null);

	const [drawerOpen, setDrawerOpen] = useState(false);

	// ===================== DEBOUNCE =====================
	useEffect(() => {
		const t = setTimeout(() => {
			setDebouncedSearch(search);
		}, 400);

		return () => clearTimeout(t);
	}, [search]);

	// ===================== URL SYNC =====================
	useEffect(() => {
		const params = new URLSearchParams();

		if (debouncedSearch)
			params.set("search", debouncedSearch);

		if (status) params.set("status", status);

		if (businessProcessed)
			params.set(
				"businessProcessed",
				businessProcessed
			);

		if (fromDate) params.set("fromDate", fromDate);

		if (toDate) params.set("toDate", toDate);

		router.replace(`?${params.toString()}`, {
			scroll: false,
		});
	}, [
		debouncedSearch,
		status,
		businessProcessed,
		fromDate,
		toDate,
	]);

	// ===================== RESET PAGE =====================
	useEffect(() => {
		setPage(1);
	}, [
		debouncedSearch,
		status,
		businessProcessed,
		fromDate,
		toDate,
		sort,
	]);

	// ===================== QUERY =====================
	const { data, isLoading, isFetching, error } =
		useQuery({
			queryKey: [
				"admin-payments",
				debouncedSearch,
				status,
				businessProcessed,
				fromDate,
				toDate,
				sort,
				page,
				limit,
			],

			queryFn: () =>
				paymentApi.getAll({
					search:
						debouncedSearch || undefined,

					status:
						(status as PaymentStatus) ||
						undefined,

					businessProcessed:
						businessProcessed === ""
							? undefined
							: businessProcessed === "true",

					fromDate: fromDate || undefined,
					toDate: toDate || undefined,

					sort,

					skip: (page - 1) * limit,
					limit,
				}),

			placeholderData: (prev) => prev,
		});

	const payments = data?.data?.data || [];
	const total = data?.data?.pagination?.total || 0;
	const totalPages =
		data?.data?.pagination?.totalPages || 1;

	if (error) {
		return (
			<div className="p-6 text-center text-red-500">
				Failed to load payments
			</div>
		);
	}

	// ===================== FILTER UI =====================
	const primary = (
		<div className="relative">
			<Search className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" />
			<input
				className="ui-input pl-8 w-48"
				placeholder="Search ref / id"
				value={search}
				onChange={(e) =>
					setSearch(e.target.value)
				}
			/>
		</div>
	);

	const secondary = (
		<>

			{/* SEARCH */}

			{/* STATUS */}
			<select
				className="ui-input"
				value={status}
				onChange={(e) =>
					setStatus(e.target.value)
				}
			>
				<option value="">All Status</option>
				<option value="pending">Pending</option>
				<option value="successful">
					Successful
				</option>
				<option value="failed">Failed</option>
				<option value="expired">Expired</option>
			</select>

			{/* BUSINESS PROCESSED */}
			<select
				className="ui-input"
				value={businessProcessed}
				onChange={(e) =>
					setBusinessProcessed(
						e.target.value
					)
				}
			>
				<option value="">All</option>
				<option value="true">Processed</option>
				<option value="false">
					Unprocessed
				</option>
			</select>

			{/* FROM */}
			<div className="flex items-center gap-1">
				<span className="text-xs text-gray-500">
					From
				</span>
				<input
					type="date"
					className="ui-input"
					value={fromDate}
					onChange={(e) =>
						setFromDate(e.target.value)
					}
				/>
			</div>

			{/* TO */}
			<div className="flex items-center gap-1">
				<span className="text-xs text-gray-500">
					To
				</span>
				<input
					type="date"
					className="ui-input"
					value={toDate}
					onChange={(e) =>
						setToDate(e.target.value)
					}
				/>
			</div>

			{/* RESET */}
			{/* <Button
				variant="ghost"
				onClick={() => {
					setSearch("");
					setStatus("");
					setBusinessProcessed("");
					setFromDate("");
					setToDate("");
					setSort("newest");
				}}
			>
				Reset
			</Button> */}
		</>
	);

	// ===================== STATUS BADGE =====================
	const statusClass = (s: string) => {
		switch (s) {
			case "successful":
				return "bg-green-100 text-green-700";
			case "pending":
				return "bg-yellow-100 text-yellow-700";
			case "failed":
				return "bg-red-100 text-red-700";
			default:
				return "bg-gray-100 text-gray-600";
		}
	};

	return (
		<>
			<AdminTableLayout
				title="Payments"
				primary={primary}
				secondary={secondary}
				actions={null}
				loading={isLoading}
				fetching={isFetching}
				isEmpty={payments.length === 0}
				emptyText="No payments found"
				page={page}
				totalPages={totalPages}
				limit={limit}
				onPageChange={setPage}
				onLimitChange={setLimit}
				mobile={
					<div className="space-y-2">
						{payments.map((p: Payment) => (
							<MobileDataCard
								key={p.id}
								onClick={() => {
									setSelectedPaymentId(p.id);
									setDrawerOpen(true);
								}}
								// className="cursor-pointer"
								title={`₦${p.amount.total.toLocaleString()}`}
								subtitle={formatRef(
									p.gatewayReference
								)}
								badge={
									<span
										className={`px-2 py-1 rounded-full text-xs ${statusClass(
											p.status
										)}`}
									>
										{p.status}
									</span>
								}
								fields={[
									{
										label: "Planamamam",
										value:
											p.planId?.name ||
											"—",
									},
									{
										label: "Date",
										value: formatDate(
											p.paymentDate
										),
									},
								]}
							/>
						))}
					</div>
				}
				table={
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>WSN</TableHead>
								<TableHead>Plan</TableHead>
								<TableHead>Amount</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Ref</TableHead>
								<TableHead>Date</TableHead>
							</TableRow>
						</TableHeader>

						<TableBody>
							{payments.map((p: Payment) => (
								<TableRow 
								onClick={() => {
									setSelectedPaymentId(p.id);
									setDrawerOpen(true);
								}}
								className="cursor-pointer hover:bg-muted/50"
								key={p.id}>
									<TableCell>
										{p.accountId?.wsnId ||
											"—"}
									</TableCell>

									<TableCell>
										{p.planId?.name ||
											"—"}
									</TableCell>

									<TableCell>
										₦
										{p.amount.total.toLocaleString()}
									</TableCell>

									<TableCell>
										<span
											className={`px-2 py-1 rounded-full text-xs ${statusClass(
												p.status
											)}`}
										>
											{p.status}
										</span>
									</TableCell>

									<TableCell className="font-mono text-xs">
										{formatRef(
											p.gatewayReference
										)}
									</TableCell>

									<TableCell>
										{formatDate(
											p.paymentDate
										)}
									</TableCell>

									<TableCell>
										<Dropdown
											trigger={
												<button>
													<MoreVertical size={16} />
												</button>
											}
										>
											<DropdownItem
												onClick={() => {
													setSelectedPaymentId(
														p.id
													);
													setDrawerOpen(true);
												}}
											>
												View
											</DropdownItem>
										</Dropdown>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				}
			/>

			<PaymentDetailsDrawer
				paymentId={selectedPaymentId}
				open={drawerOpen}
				onClose={() => {
					setDrawerOpen(false);
					setSelectedPaymentId(null);
				}}
			/>
		</>
	);
}
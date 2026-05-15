"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import {
	Search,
	MoreVertical,
	Plus,
	CreditCard,
	Calendar,
} from "lucide-react";

import AdminTableLayout from "@/components/layout/AdminTableLayout";

import {
	Table,
	TableHeader,
	TableBody,
	TableRow,
	TableHead,
	TableCell,
} from "@/components/ui/Table";

import { MobileDataCard } from "@/components/ui/MobileDataCard";

import Dropdown, {
	DropdownItem,
	DropdownDivider,
} from "@/components/ui/Dropdown";

import Button from "@/components/ui/Button";

import { paymentApi, Payment } from "@/lib/api/payment";

import { useAuth } from "@/context/AuthContext";

import Modal from "@/components/ui/Modal"; // assuming you already have this
import PaymentForm from "@/components/forms/PaymentForm"; // your create form

export default function AdminPaymentsPage() {
	const { activeAccount } = useAuth();
	const queryClient = useQueryClient();

	// ================= STATE =================
	const [search, setSearch] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");

	const [status, setStatus] = useState("");
	const [method, setMethod] = useState("");

	const [sortOrder, setSortOrder] =
		useState<"asc" | "desc">("desc");

	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);

	// MODAL
	const [openCreate, setOpenCreate] = useState(false);
	const [creating, setCreating] = useState(false);

	// ================= DEBOUNCE =================
	useEffect(() => {
		const t = setTimeout(() => setDebouncedSearch(search), 400);
		return () => clearTimeout(t);
	}, [search]);

	useEffect(() => {
		setPage(1);
	}, [debouncedSearch, status, method, sortOrder]);

	// ================= QUERY =================
	const { data, isLoading, isFetching, error } = useQuery({
		queryKey: [
			"admin-payments",
			debouncedSearch,
			status,
			method,
			sortOrder,
			page,
			limit,
		],
		queryFn: () =>
			paymentApi.getAll({
				search: debouncedSearch || undefined,
				status: status || undefined,
				method: method || undefined,
				sortOrder,
				page,
				limit,
			}),
		keepPreviousData: true,
	});

	const payments = data?.data?.data || [];
	const total = data?.data?.total || 0;
	const totalPages = Math.ceil(total / limit);

	if (error) {
		return (
			<div className="p-6 text-center text-danger">
				Failed to load payments
			</div>
		);
	}

	// ================= CREATE PAYMENT =================
	const handleCreate = async (payload: any) => {
		try {
			setCreating(true);

			await paymentApi.create(payload);

			await queryClient.invalidateQueries({
				queryKey: ["admin-payments"],
			});

			setOpenCreate(false);
		} finally {
			setCreating(false);
		}
	};

	// ================= TOOLBAR =================
	const primary = (
		<div className="relative w-full md:w-72">
			<Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
			<input
				value={search}
				onChange={(e) => setSearch(e.target.value)}
				placeholder="Search WSN or Transaction ID"
				className="ui-input pl-10 w-full"
			/>
		</div>
	);

	const secondary = (
		<>
			<select className="ui-input" value={status} onChange={(e) => setStatus(e.target.value)}>
				<option value="">All Status</option>
				<option value="successful">Successful</option>
				<option value="pending">Pending</option>
				<option value="failed">Failed</option>
				<option value="expired">Expired</option>
			</select>

			<select className="ui-input" value={method} onChange={(e) => setMethod(e.target.value)}>
				<option value="">All Methods</option>
				<option value="paystack">Paystack</option>
				<option value="credit_card">Credit Card</option>
				<option value="bank_transfer">Bank Transfer</option>
			</select>

			<select className="ui-input" value={limit} onChange={(e) => {
				setLimit(Number(e.target.value));
				setPage(1);
			}}>
				<option value={10}>10</option>
				<option value={20}>20</option>
				<option value={50}>50</option>
			</select>
		</>
	);

	const actions = (
		<Button
			variant="accent"
			leftIcon={<Plus size={16} />}
			onClick={() => setOpenCreate(true)}
		>
			Create Payment
		</Button>
	);

	// ================= RENDER =================
	return (
		<>
			<AdminTableLayout
				title="Payments Management"
				primary={primary}
				secondary={secondary}
				actions={actions}
				loading={isLoading}
				fetching={isFetching}
				isEmpty={payments.length === 0}
				emptyText="No payments found"
				page={page}
				totalPages={totalPages}
				limit={limit}
				onPageChange={setPage}
				onLimitChange={setLimit}

				// ================= MOBILE =================
				mobile={
					<div className="ui-stack">
						{payments.map((p: Payment) => (
							<MobileDataCard
								key={p.id}
								title={`₦${p.amount.toLocaleString()}`}
								subtitle={p.account.wsnId}
								badge={
									<span className="ui-badge">
										{p.status}
									</span>
								}
								fields={[
									{
										label: "Transaction",
										value: p.transactionId || "—",
									},
									{
										label: "Method",
										value: p.method,
									},
									{
										label: "Date",
										value: new Date(p.paymentDate).toLocaleDateString(),
									},
								]}
							/>
						))}
					</div>
				}

				// ================= TABLE =================
				table={
					<Table>
						<TableHeader>
							<tr>
								<TableHead>WSN</TableHead>
								<TableHead>Amount</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Method</TableHead>
								<TableHead>Transaction</TableHead>
								<TableHead>Date</TableHead>
								<TableHead />
							</tr>
						</TableHeader>

						<TableBody>
							{payments.map((p: Payment) => (
								<TableRow key={p.id}>
									<TableCell>{p.account.wsnId || "—"}</TableCell>

									<TableCell>
										₦{p.amount.toLocaleString()}
									</TableCell>

									<TableCell>
										<span className="ui-badge">
											{p.status}
										</span>
									</TableCell>

									<TableCell>{p.method}</TableCell>

									<TableCell className="font-mono text-xs">
										{p.transactionId || "—"}
									</TableCell>

									<TableCell>
										{new Date(p.paymentDate).toLocaleDateString()}
									</TableCell>

									<TableCell>
										<Dropdown
											trigger={<button><MoreVertical /></button>}
										>
											<DropdownItem>View</DropdownItem>
											<DropdownDivider />
											<DropdownItem>Refund</DropdownItem>
										</Dropdown>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				}
			/>

			{/* ================= CREATE MODAL ================= */}
			<Modal
				open={openCreate}
				onClose={() => setOpenCreate(false)}
				title="Create Payment"
			>
				<PaymentForm
					onSubmit={handleCreate}
					isLoading={creating}
				/>
			</Modal>
		</>
	);
}
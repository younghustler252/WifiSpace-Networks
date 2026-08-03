"use client";

import { useMemo, useState } from "react";
import { useAllPayments } from "@/features/payment/hooks/usePayment";
import type { Payment } from "@/features/payment/api/payment.types";
import {
	CalendarDays,
	Search,
	ArrowUpDown,
	Package,
	ChevronRight,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";

import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import PaymentDetailsDrawer from "@/features/payment/paymentDetailsDrawer";

/* ================================
   TYPES
================================ */

type PlanRef = {
	_id: string;
	name: string;
	price?: number;
};

export default function PaymentsPage() {
	const { activeAccount } = useAuth();

	const [status, setStatus] = useState<Payment["status"]>("successful");
	const [search, setSearch] = useState("");
	const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
	const [selectedPayment, setSelectedPayment] = useState<string | null>(null);

	/* ================================
	   QUERY
	================================ */

	const {
		data,
		error,
		isLoading,
		isFetching,
	} = useAllPayments({
		accountId: activeAccount?.id,
		status,
		limit: 50,
		skip: 0,
		sort: sortOrder === "desc" ? "newest" : "oldest",
	});
	const payments = data?.data ?? [];

	/* ================================
	   SEARCH FILTER (client-side)
	================================ */

	const filteredPayments = useMemo(() => {
		const q = search.toLowerCase();

		return payments.filter((p) => {
			const planName =
				typeof p.planId === "string"
					? p.planId
					: (p.planId as PlanRef)?.name || "";

			const reference = p.gatewayReference || "";

			return (
				planName.toLowerCase().includes(q) ||
				reference.toLowerCase().includes(q)
			);
		});
	}, [payments, search]);

	/* ================================
	   ERROR
	================================ */

	if (error) {
		return (
			<div className="p-6 text-red-500">
				Failed to load payments
			</div>
		);
	}

	/* ================================
	   UI
	================================ */

	return (
		<div className="pb-10">

			{/* HEADER */}
			<PageHeader
				title="Payments"
				subtitle="View your billing history and subscription activity."
				actions={
					<div className="flex flex-col w-full gap-2 sm:flex-row sm:w-auto">

						{/* SEARCH */}
						<div className="relative w-full sm:w-[240px]">
							<Search
								size={16}
								className="absolute -translate-y-1/2 left-3 top-1/2 text-muted-foreground"
							/>

							<input
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								placeholder="Search payments..."
								className="w-full pl-10 pr-4 text-sm border outline-none h-11 rounded-2xl border-border/60 bg-background focus:border-primary/30 focus:ring-4 focus:ring-primary/10"
							/>
						</div>

						{/* STATUS */}
						<select
							value={status}
							onChange={(e) => setStatus(e.target.value as Payment["status"])}
							className="px-4 text-sm border outline-none h-11 rounded-2xl border-border/60 bg-background focus:border-primary/30 focus:ring-4 focus:ring-primary/10"
						>
							<option value="">All Status</option>
							<option value="successful">Successful</option>
							<option value="pending">Pending</option>
							<option value="failed">Failed</option>
						</select>

						{/* SORT */}
						<Button
							variant="outline"
							className="h-11 rounded-2xl"
							leftIcon={<ArrowUpDown size={15} />}
							onClick={() =>
								setSortOrder(sortOrder === "desc" ? "asc" : "desc")
							}
						>
							{sortOrder === "desc" ? "Newest" : "Oldest"}
						</Button>

					</div>
				}
			/>

			{/* FETCHING BAR */}
			{isFetching && !isLoading && (
				<div className="px-6 pt-3">
					<div className="w-full h-1 overflow-hidden rounded-full bg-muted">
						<div className="w-1/3 h-full rounded-full animate-pulse bg-primary" />
					</div>
				</div>
			)}

			{/* CONTENT */}
			<div className="px-4 pt-5 sm:px-6">

				{/* EMPTY */}
				{!isLoading && filteredPayments.length === 0 && (
					<div className="text-sm text-center border border-dashed rounded-3xl border-border py-14 text-muted-foreground">
						No payments found
					</div>
				)}

				{/* LOADING */}
				{isLoading && (
					<div className="space-y-3">
						{Array.from({ length: 6 }).map((_, i) => (
							<div
								key={i}
								className="h-[88px] animate-pulse rounded-3xl bg-muted"
							/>
						))}
					</div>
				)}

				{/* PAYMENTS */}
				<div className="space-y-3">

					{filteredPayments.map((p) => {
						const planName =
							typeof p.planId === "string"
								? p.planId
								: (p.planId as PlanRef)?.name || "Unknown Plan";

						const statusStyles =
							p.status === "successful"
								? "bg-emerald-50 text-emerald-600 border-emerald-100"
								: p.status === "pending"
								? "bg-amber-50 text-amber-600 border-amber-100"
								: "bg-red-50 text-red-600 border-red-100";

						return (
							<button
								key={p.id}
								onClick={() => setSelectedPayment(p.id)}
								className="group w-full text-left rounded-3xl border border-border/60 bg-background/80 backdrop-blur-sm p-4 sm:p-5 transition-all hover:shadow-xl hover:border-primary/20 active:scale-[0.99]"
							>

								<div className="flex items-center justify-between gap-3">

									{/* LEFT */}
									<div className="flex items-center min-w-0 gap-3">

										<div className="flex items-center justify-center h-11 w-11 rounded-2xl bg-primary/10 text-primary">
											<Package size={18} />
										</div>

										<div className="min-w-0">

											<div className="flex flex-wrap items-center gap-2">

												<h3 className="text-base font-semibold">
													₦{p.amount?.total?.toLocaleString()}
												</h3>

												<span className={`px-2 py-1 rounded-full text-[10px] border ${statusStyles}`}>
													{p.status}
												</span>

											</div>

											<p className="text-sm truncate text-muted-foreground">
												{planName}
											</p>

											<div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-muted-foreground">

												<div className="flex items-center gap-1">
													<CalendarDays size={12} />
													{new Date(p.paymentDate).toLocaleDateString()}
												</div>

												<div className="truncate max-w-[140px]">
													Ref: {p.gatewayReference || "N/A"}
												</div>

											</div>

										</div>

									</div>

									{/* RIGHT */}
									<div className="items-center hidden gap-1 text-sm font-medium sm:flex text-primary">
										<span>View</span>
										<ChevronRight size={16} />
									</div>

								</div>

							</button>
						);
					})}

				</div>
			</div>

			{/* DRAWER */}
			<PaymentDetailsDrawer
				paymentId={selectedPayment}
				open={!!selectedPayment}
				onClose={() => setSelectedPayment(null)}
			/>
		</div>
	);
}
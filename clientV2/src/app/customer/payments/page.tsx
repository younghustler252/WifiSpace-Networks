"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import {
	CalendarDays,
	Search,
	ArrowUpDown,
	Package,
	ChevronRight,
} from "lucide-react";

import { paymentApi, Payment } from "@/lib/api/payment";
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

	const [status, setStatus] = useState("");
	const [search, setSearch] = useState("");
	const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
	const [selectedPayment, setSelectedPayment] = useState<string | null>(null);

	/* ================================
	   QUERY
	================================ */

	const { data, error, isLoading, isFetching } = useQuery({
		queryKey: ["payments", activeAccount?.id, status, sortOrder],

		queryFn: () =>
			paymentApi.getAll({
				accountId: activeAccount?.id,
				status: status
					? (status as Payment["status"])
					: undefined,

				limit: 50,
				skip: 0,

				sort: sortOrder === "desc" ? "newest" : "oldest",
			}),

		enabled: !!activeAccount,

		placeholderData: (prev) => prev,

		staleTime: 1000 * 60 * 5,
		gcTime: 1000 * 60 * 30,

		refetchOnWindowFocus: false,
		refetchOnReconnect: true,
		retry: 2,
	});
	const payments: Payment[] = data?.data?.data ?? [];

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
					<div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">

						{/* SEARCH */}
						<div className="relative w-full sm:w-[240px]">
							<Search
								size={16}
								className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
							/>

							<input
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								placeholder="Search payments..."
								className="h-11 w-full rounded-2xl border border-border/60 bg-background pl-10 pr-4 text-sm outline-none focus:border-primary/30 focus:ring-4 focus:ring-primary/10"
							/>
						</div>

						{/* STATUS */}
						<select
							value={status}
							onChange={(e) => setStatus(e.target.value)}
							className="h-11 rounded-2xl border border-border/60 bg-background px-4 text-sm outline-none focus:border-primary/30 focus:ring-4 focus:ring-primary/10"
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
					<div className="h-1 w-full overflow-hidden rounded-full bg-muted">
						<div className="h-full w-1/3 animate-pulse rounded-full bg-primary" />
					</div>
				</div>
			)}

			{/* CONTENT */}
			<div className="px-4 sm:px-6 pt-5">

				{/* EMPTY */}
				{!isLoading && filteredPayments.length === 0 && (
					<div className="rounded-3xl border border-dashed border-border py-14 text-center text-sm text-muted-foreground">
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
									<div className="flex items-center gap-3 min-w-0">

										<div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
											<Package size={18} />
										</div>

										<div className="min-w-0">

											<div className="flex flex-wrap items-center gap-2">

												<h3 className="font-semibold text-base">
													₦{p.amount?.total?.toLocaleString()}
												</h3>

												<span className={`px-2 py-1 rounded-full text-[10px] border ${statusStyles}`}>
													{p.status}
												</span>

											</div>

											<p className="text-sm text-muted-foreground truncate">
												{planName}
											</p>

											<div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1">

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
									<div className="hidden sm:flex items-center gap-1 text-sm font-medium text-primary">
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
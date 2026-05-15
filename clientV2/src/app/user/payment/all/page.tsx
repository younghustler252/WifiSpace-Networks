"use client";

import { useMemo, useState } from "react";

import {
	CalendarDays,
	CheckCircle2,
	Clock3,
	Wallet,
	XCircle,
	Search,
	ArrowUpDown,
	CreditCard,
	BadgeCheck,
} from "lucide-react";

import { useQuery } from "@tanstack/react-query";

import { paymentApi, Payment } from "@/lib/api/payment";

import { useAuth } from "@/context/AuthContext";

import PageHeader from "@/components/ui/PageHeader";

import { CenterLoader } from "@/components/ui/Loader";

import Button from "@/components/ui/Button";

export default function PaymentsPage() {

	const { activeAccount } = useAuth();

	/* ================= FILTERS ================= */

	const [status, setStatus] = useState("");

	const [search, setSearch] = useState("");

	const [sortOrder, setSortOrder] =
		useState<"asc" | "desc">("desc");

	const [page] = useState(1);

	/* ================= QUERY ================= */

	const {
		data,
		isLoading,
		error,
	} = useQuery({
		queryKey: [
			"payments",
			activeAccount?.id,
			status,
			search,
			sortOrder,
			page,
		],

		queryFn: () =>
			paymentApi.getAll({
				accountId: activeAccount?.id,

				status:
					status || undefined,

				sortField:
					"paymentDate",

				sortOrder,

				page,

				limit: 50,
			}),

		enabled: !!activeAccount,
	});

	/* ================= DATA ================= */

	const payments = Array.isArray(
		data?.data?.data
	)
		? data.data.data
		: [];

	/* ================= FILTERED ================= */

	const filteredPayments = useMemo(() => {

		return payments.filter(
			(payment: Payment) => {

				const query =
					search.toLowerCase();

				return (
					payment?.transactionId
						?.toLowerCase()
						.includes(query) ||

					payment?.wsnId
						?.toLowerCase()
						.includes(query)
				);
			}
		);

	}, [payments, search]);

	/* ================= STATS ================= */

	const stats = useMemo(() => {

		const totalPaid =
			payments.reduce(
				(
					sum: number,
					payment: Payment
				) =>
					payment.status ===
					"successful"
						? sum +
						  payment.amount
						: sum,
				0
			);

		const successful =
			payments.filter(
				(payment: Payment) =>
					payment.status ===
					"successful"
			).length;

		const pending =
			payments.filter(
				(payment: Payment) =>
					payment.status ===
					"pending"
			).length;

		return {
			totalPaid,
			successful,
			pending,
		};

	}, [payments]);

	/* ================= STATES ================= */

	if (isLoading) {
		return (
			<CenterLoader label="Loading payments..." />
		);
	}

	if (error) {
		return (
			<div className="p-6 text-center text-danger">
				Failed to load payments
			</div>
		);
	}

	/* ================= STATUS STYLES ================= */

	const statusStyles = {
		successful:
			"bg-success/10 text-success border-success/20",

		pending:
			"bg-warning/10 text-warning border-warning/20",

		failed:
			"bg-danger/10 text-danger border-danger/20",

		expired:
			"bg-muted text-muted-foreground border-border",
	};

	return (
		<div className="space-y-8">

			{/* ================= HEADER ================= */}

			<PageHeader
				title="Payments"
				subtitle="Track customer payments, subscriptions and transaction activity."
				actions={

					<div className="flex flex-wrap items-center gap-3">

						{/* SEARCH */}
						<div className="relative">

							<Search
								size={16}
								className="
									absolute left-3 top-1/2
									-transform -translate-y-1/2
									text-muted-foreground
								"
							/>

							<input
								value={search}
								onChange={(e) =>
									setSearch(
										e.target.value
									)
								}
								placeholder="Search WSN ID or Tx ID"
								className="
									ui-input
									pl-9
									w-[240px]
								"
							/>

						</div>

						{/* STATUS */}
						<select
							value={status}
							onChange={(e) =>
								setStatus(
									e.target.value
								)
							}
							className="
								h-11 px-4 rounded-xl
								bg-muted/50
								border border-border/60
								text-sm
								outline-none
								focus:ring-4
								focus:ring-accent/10
								focus:border-accent
							"
						>

							<option value="">
								All Status
							</option>

							<option value="successful">
								Successful
							</option>

							<option value="pending">
								Pending
							</option>

							<option value="failed">
								Failed
							</option>

						</select>

						{/* SORT */}
						<Button
							variant="outline"
							leftIcon={
								<ArrowUpDown size={15} />
							}
							onClick={() =>
								setSortOrder(
									sortOrder ===
										"desc"
										? "asc"
										: "desc"
								)
							}
						>
							{sortOrder === "desc"
								? "Newest"
								: "Oldest"}
						</Button>

					</div>
				}
			/>

			{/* ================= STATS ================= */}

			<div className="grid grid-cols-1 md:grid-cols-3 gap-5">

				<StatCard
					label="Total Revenue"
					value={`₦${stats.totalPaid.toLocaleString()}`}
					icon={<Wallet size={18} />}
				/>

				<StatCard
					label="Successful Payments"
					value={stats.successful}
					icon={<CheckCircle2 size={18} />}
				/>

				<StatCard
					label="Pending Payments"
					value={stats.pending}
					icon={<Clock3 size={18} />}
				/>

			</div>

			{/* ================= PAYMENTS ================= */}

			<div className="space-y-4">

				{filteredPayments.length === 0 && (
					<div className="ui-card text-center py-14">

						<div className="flex justify-center mb-4">
							<div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
								<Wallet
									size={22}
									className="text-muted-foreground"
								/>
							</div>
						</div>

						<h3 className="text-lg font-semibold">
							No payments found
						</h3>

						<p className="text-sm text-muted-foreground mt-2">
							Payments will appear here once transactions are made.
						</p>

					</div>
				)}

				{filteredPayments.map(
					(payment: Payment) => (

						<div
							key={payment.id}
							className="
								ui-card
								p-5
								hover:border-accent/20
								group
							"
						>

							<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">

								{/* LEFT */}
								<div className="flex items-start gap-4 min-w-0">

									<div
										className="
											w-12 h-12 rounded-2xl
											bg-accent/10
											text-accent
											flex items-center justify-center
											flex-shrink-0
										"
									>
										<CreditCard size={20} />
									</div>

									<div className="space-y-3 min-w-0">

										<div>

											<div className="flex items-center gap-2 flex-wrap">

												<h3 className="font-semibold text-base truncate">
													₦{payment.amount.toLocaleString()}
												</h3>

												<span
													className={`
														text-xs px-2.5 py-1 rounded-full border capitalize font-medium
														${statusStyles[payment.status]}
													`}
												>
													{payment.status}
												</span>

											</div>

											<p className="text-sm text-muted-foreground mt-1">
												{payment.method
													.replace("_", " ")
													.toUpperCase()}
											</p>

										</div>

										<div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">

											<div className="flex items-center gap-2 text-muted-foreground">

												<BadgeCheck size={14} />

												<span>
													WSN:
												</span>

												<span className="text-foreground font-medium">
													{payment.wsnId || "—"}
												</span>

											</div>

											<div className="flex items-center gap-2 text-muted-foreground">

												<CalendarDays size={14} />

												<span>
													{new Date(
														payment.paymentDate
													).toLocaleDateString()}
												</span>

											</div>

										</div>

										{/* SUBSCRIPTION INFO */}
										<div className="flex flex-wrap gap-3">

											{payment.subscriptionStartDate && (
												<div className="text-xs px-3 py-1.5 rounded-lg bg-muted text-muted-foreground">
													Start:
													{" "}
													{new Date(
														payment.subscriptionStartDate
													).toLocaleDateString()}
												</div>
											)}

											{payment.subscriptionEndDate && (
												<div className="text-xs px-3 py-1.5 rounded-lg bg-muted text-muted-foreground">
													End:
													{" "}
													{new Date(
														payment.subscriptionEndDate
													).toLocaleDateString()}
												</div>
											)}

											<div
												className="
													text-xs px-3 py-1.5
													rounded-lg
													bg-accent/10
													text-accent
													capitalize
												"
											>
												{payment.subscriptionStatus}
											</div>

										</div>

									</div>

								</div>

								{/* RIGHT */}
								<div className="flex flex-col items-start lg:items-end gap-3">

									<div className="text-right">

										<p className="text-xs uppercase tracking-wide text-muted-foreground">
											Transaction ID
										</p>

										<p className="text-sm font-mono font-medium mt-1 break-all">
											{payment.transactionId || "N/A"}
										</p>

									</div>

									<Button
										variant="outline"
										size="sm"
									>
										View Details
									</Button>

								</div>

							</div>

						</div>
					)
				)}

			</div>

		</div>
	);
}

/* ================= STAT CARD ================= */

function StatCard({
	label,
	value,
	icon,
}: {
	label: string;
	value: string | number;
	icon: React.ReactNode;
}) {
	return (
		<div className="ui-card">

			<div className="flex items-start justify-between">

				<div>

					<p className="text-sm text-muted-foreground">
						{label}
					</p>

					<h3 className="text-2xl font-semibold mt-2">
						{value}
					</h3>

				</div>

				<div
					className="
						w-11 h-11 rounded-2xl
						bg-accent/10 text-accent
						flex items-center justify-center
					"
				>
					{icon}
				</div>

			</div>

		</div>
	);
}
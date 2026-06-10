"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import {
	Receipt,
	ChevronRight,
	Wifi,
	CalendarDays,
} from "lucide-react";

import { paymentApi, Payment } from "@/lib/api/payment";
import PaymentDetailsDrawer from "@/features/payment/paymentDetailsDrawer";
import { Console, log } from "console";

type Props = {
	accountId: string;
};

export function PaymentSummary({ accountId }: Props) {

	const [selectedPayment, setSelectedPayment] =
		useState<string | null>(null);

	const { data, isLoading } = useQuery({
		queryKey: ["payment-summary", accountId],

		queryFn: () =>
			paymentApi.getAll({
				accountId: accountId,
				limit: 5,
				skip: 0,
				sort: "newest",
			}),

		enabled: !!accountId,
	});
	// console.log(data)
	const payments: Payment[] =
		data?.data?.data ?? [];
	// console.log(payments)

	return (
		<>
			<div className="rounded-xl border border-border bg-card p-5">

				{/* HEADER */}
				<div className="flex items-center justify-between mb-4">

					<div className="flex items-center gap-2">
						<Receipt size={16} />
						<h3 className="font-medium">
							Payment Summary
						</h3>
					</div>

					<Link
						href="/payments"
						className="text-xs text-primary flex items-center gap-1"
					>
						View All
						<ChevronRight size={12} />
					</Link>

				</div>

				{/* LOADING */}
				{isLoading && (
					<div className="space-y-3">
						{Array.from({ length: 3 }).map((_, i) => (
							<div
								key={i}
								className="h-20 animate-pulse rounded-xl bg-muted"
							/>
						))}
					</div>
				)}

				{/* EMPTY */}
				{!isLoading && payments.length === 0 && (
					<div className="text-sm text-muted-foreground text-center py-6">
						No payments found
					</div>
				)}

				{/* PAYMENTS */}
				<div className="space-y-3">

					{payments.map((payment) => {

						const plan = payment.planId as any;

						const statusStyles =
							payment.status === "successful"
								? "bg-emerald-100 text-emerald-700"
								: payment.status === "pending"
								? "bg-amber-100 text-amber-700"
								: "bg-red-100 text-red-700";

						return (
							<button
								key={payment.id}
								onClick={() =>
									setSelectedPayment(payment.id)
								}
								className="w-full text-left p-3 rounded-xl border border-border hover:bg-muted/40 transition"
							>

								<div className="flex items-start justify-between gap-3">

									<div className="min-w-0 flex-1">

										<div className="font-semibold">
											₦{payment.amount?.total?.toLocaleString()}
										</div>

										<div className="text-sm mt-1 truncate">
											{plan?.name || "Unknown Plan"}
										</div>

										<div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">

											<div className="flex items-center gap-1">
												<Wifi size={12} />
												{plan?.speedRate || "—"}
											</div>

											<div>
												{payment.cycles} cycle(s)
											</div>

											<div className="flex items-center gap-1">
												<CalendarDays size={12} />
												{new Date(payment.paymentDate).toLocaleDateString()}
											</div>

										</div>

									</div>

									<span className={`text-[10px] px-2 py-1 rounded-full whitespace-nowrap ${statusStyles}`}>
										{payment.status}
									</span>

								</div>

							</button>
						);
					})}

				</div>
			</div>

			<PaymentDetailsDrawer
				paymentId={selectedPayment}
				open={!!selectedPayment}
				onClose={() => setSelectedPayment(null)}
			/>
		</>
	);
}
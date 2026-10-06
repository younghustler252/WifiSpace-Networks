"use client";

import { useState } from "react";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDateTime, humanize } from "@/lib/format";
import { useAdminPayments } from "../hooks/use-payments";
import { getProvisioning, paymentDateOf, paymentTotal } from "../lib/payment-helpers";
import type { AdminPayment, AdminPaymentListParams } from "../types/payments.types";
import { PaymentDetailsDialog } from "./payment-dialogs";

interface LinkedPaymentsCardProps {
	params: Pick<AdminPaymentListParams, "accountId" | "subscriptionId" | "userId">;
	description?: string;
}

export function LinkedPaymentsCard({ params, description = "Tap a payment to see where it was made." }: LinkedPaymentsCardProps) {
	const [selected, setSelected] = useState<AdminPayment | null>(null);
	const { data, isLoading, isError } = useAdminPayments({ ...params, limit: 8 });

	function renderBody() {
		if (isLoading) return <Skeleton className="h-24 rounded-lg" />;
		if (isError || !data) return <p className="text-[13px] text-muted-foreground">Payments aren&apos;t available right now.</p>;
		if (data.items.length === 0) return <p className="text-[13px] text-muted-foreground">No payments yet.</p>;

		return (
			<ul className="divide-y">
				{data.items.map((payment) => {
					const date = paymentDateOf(payment);
					const device = getProvisioning(payment)?.macAddress;

					return (
						<li key={payment.id}>
							<button
								type="button"
								onClick={() => setSelected(payment)}
								className="flex w-full items-center justify-between gap-3 py-3 text-left first:pt-0 last:pb-0"
							>
								<div className="min-w-0">
									<p className="text-mono text-[13px]">{formatCurrency(paymentTotal(payment))}</p>
									<p className="truncate text-[11px] text-muted-foreground">
										{[date ? formatDateTime(date) : null, payment.plan?.name, humanize(payment.paymentChannel ?? payment.gateway), device]
											.filter(Boolean)
											.join(" · ")}
									</p>
								</div>
								<StatusBadge status={payment.status} />
							</button>
						</li>
					);
				})}
			</ul>
		);
	}

	return (
		<SectionCard title="Payments" description={data?.meta ? `${data.meta.total} in total. ${description}` : description}>
			{renderBody()}
			{selected && <PaymentDetailsDialog payment={selected} onClose={() => setSelected(null)} />}
		</SectionCard>
	);
}
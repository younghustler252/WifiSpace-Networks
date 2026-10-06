"use client";

import { useState } from "react";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PaymentDetailsDialog } from "@/features/payments/components/payment-dialogs";
import { useAdminPayments } from "@/features/payments/hooks/use-payments";
import { getProvisioning, paymentDateOf, paymentTotal } from "@/features/payments/lib/payment-helpers";
import type { AdminPayment } from "@/features/payments/types/payments.types";
import { formatCurrency, formatDateTime, humanize } from "@/lib/format";

export function SubscriptionPaymentsCard({ subscriptionId }: { subscriptionId: string }) {
	const [selected, setSelected] = useState<AdminPayment | null>(null);
	const { data, isLoading, isError } = useAdminPayments({ subscriptionId, limit: 10 });

	function renderBody() {
		if (isLoading) return <Skeleton className="h-24 rounded-lg" />;
		if (isError || !data) return <p className="text-[13px] text-muted-foreground">Payments aren&apos;t available right now.</p>;
		if (data.items.length === 0) return <p className="text-[13px] text-muted-foreground">No payments are linked to this subscription.</p>;

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
										{[date ? formatDateTime(date) : null, humanize(payment.paymentChannel ?? payment.gateway), device].filter(Boolean).join(" · ")}
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
		<SectionCard title="Payments" description="Tap a payment to see where it was made.">
			{renderBody()}
			{selected && <PaymentDetailsDialog payment={selected} onClose={() => setSelected(null)} />}
		</SectionCard>
	);
}
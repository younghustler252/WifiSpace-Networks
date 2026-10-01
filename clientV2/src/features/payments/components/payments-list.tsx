"use client";

import { useState } from "react";
import Link from "next/link";
import { Receipt, WifiOff } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { StatusMessage } from "@/components/shared/status-message";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { usePayments } from "../hooks/use-payments";
import type { Payment } from "../types/payments.types";

function paymentDate(payment: Payment) {
	const date = payment.processedAt ?? payment.createdAt;
	return date ? formatDateTime(date) : "—";
}

function capitalize(value: string) {
	return value.charAt(0).toUpperCase() + value.slice(1);
}

export function PaymentsList() {
	const [page, setPage] = useState(1);
	const { data, isLoading, isError, isPlaceholderData, refetch } = usePayments(page);

	function renderBody() {
		if (isLoading) return <Skeleton className="h-64 rounded-xl" />;

		if (isError || !data) {
			return (
				<StatusMessage icon={WifiOff} tone="warning" title="We couldn't load your payments" text="Check your connection and try again.">
					<Button size="lg" className="w-full" onClick={() => refetch()}>
						Try again
					</Button>
				</StatusMessage>
			);
		}

		const { items, meta } = data;

		if (items.length === 0 && page === 1) {
			return (
				<StatusMessage icon={Receipt} title="No payments yet" text="Your payments will show up here once you buy a plan.">
					<Button asChild size="lg" className="w-full">
						<Link href="/plans">Choose a plan</Link>
					</Button>
				</StatusMessage>
			);
		}

		return (
			<SectionCard
				title="Payment history"
				description={meta ? `${meta.total} payment${meta.total === 1 ? "" : "s"}` : undefined}
				className={isPlaceholderData ? "opacity-60 transition-opacity" : undefined}
			>
				<div className="hidden md:block">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Date</TableHead>
								<TableHead>Reference</TableHead>
								<TableHead>Method</TableHead>
								<TableHead className="text-right">Amount</TableHead>
								<TableHead className="text-right">Status</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{items.map((p) => (
								<TableRow key={p.id}>
									<TableCell className="whitespace-nowrap text-[13px]">{paymentDate(p)}</TableCell>
									<TableCell className="text-mono max-w-48 truncate text-[12px] text-muted-foreground">{p.gatewayReference}</TableCell>
									<TableCell className="text-[13px]">{capitalize(p.gateway)}</TableCell>
									<TableCell className="text-right">
										<span className="text-mono text-[13px]">{formatCurrency(p.amount.total)}</span>
										{p.amount.discount > 0 && (
											<span className="block text-[11px] text-muted-foreground">Saved {formatCurrency(p.amount.discount)}</span>
										)}
									</TableCell>
									<TableCell className="text-right">
										<StatusBadge status={p.status} />
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>

				<ul className="divide-y md:hidden">
					{items.map((p) => (
						<li key={p.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
							<div className="min-w-0">
								<p className="text-mono text-[13px]">{formatCurrency(p.amount.total)}</p>
								<p className="text-[11px] text-muted-foreground">{paymentDate(p)}</p>
								<p className="text-mono truncate text-[11px] text-muted-foreground">{p.gatewayReference}</p>
							</div>
							<StatusBadge status={p.status} />
						</li>
					))}
				</ul>

				{meta && meta.totalPages > 1 && (
					<div className="mt-4 flex items-center justify-between border-t pt-4">
						<Button variant="outline" size="sm" className="bg-surface-2" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
							Previous
						</Button>
						<span className="text-[12px] text-muted-foreground">
							Page {meta.page} of {meta.totalPages}
						</span>
						<Button
							variant="outline"
							size="sm"
							className="bg-surface-2"
							disabled={page >= meta.totalPages}
							onClick={() => setPage((p) => p + 1)}
						>
							Next
						</Button>
					</div>
				)}
			</SectionCard>
		);
	}

	return (
		<div className="space-y-6">
			<PageHeader title="Payments" description="Everything you've paid, newest first." />
			{renderBody()}
		</div>
	);
}
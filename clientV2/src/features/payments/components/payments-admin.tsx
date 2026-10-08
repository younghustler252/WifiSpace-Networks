"use client";

import { useEffect, useState } from "react";
import { Plus, Receipt, Search, WifiOff } from "lucide-react";
import { FILTER_ALL as ALL, FilterSelect } from "@/components/shared/filter-select";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { SimplePagination } from "@/components/shared/simple-pagination";
import { StatusMessage } from "@/components/shared/status-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { PAYMENT_STATUS_OPTIONS } from "../constants";
import { useAdminPayments } from "../hooks/use-payments";
import type { AdminPayment } from "../types/payments.types";
import { AdminPaymentsTable, type PaymentAction } from "./admin-payments-table";
import { PaymentDetailsDialog, UpdateStatusDialog, ReversePaymentDialog } from "./payment-dialogs";
import { RecordPaymentDialog } from "./record-payment-dialog";


export function PaymentsAdmin() {
	const [search, setSearch] = useState("");
	const [status, setStatus] = useState(ALL);
	const [page, setPage] = useState(1);
	const [recording, setRecording] = useState(false);
	const [dialog, setDialog] = useState<{ action: PaymentAction; payment: AdminPayment } | null>(null);
	const debouncedSearch = useDebouncedValue(search, 350);

	useEffect(() => {
		setPage(1);
	}, [debouncedSearch, status]);

	const { data, isLoading, isError, isPlaceholderData, refetch } = useAdminPayments({
		search: debouncedSearch.trim() || undefined,
		status: status === ALL ? undefined : status,
		page,
	});

	const filtered = !!debouncedSearch.trim() || status !== ALL;
	const close = () => setDialog(null);

	function renderBody() {
		if (isLoading) return <Skeleton className="h-96 rounded-xl" />;

		if (isError || !data) {
			return (
				<StatusMessage icon={WifiOff} tone="warning" title="We couldn't load payments" text="Check your connection and try again.">
					<Button size="lg" className="w-full" onClick={() => refetch()}>
						Try again
					</Button>
				</StatusMessage>
			);
		}

		if (data.items.length === 0) {
			return (
				<StatusMessage
					icon={Receipt}
					title="No payments found"
					text={filtered ? "Try a different reference or status." : "Payments will appear here as customers pay."}
				>
					{filtered && (
						<Button
							size="lg"
							variant="outline"
							className="w-full bg-surface-2"
							onClick={() => {
								setSearch("");
								setStatus(ALL);
							}}
						>
							Clear filters
						</Button>
					)}
				</StatusMessage>
			);
		}

		return (
			<div className={isPlaceholderData ? "opacity-60 transition-opacity" : undefined}>
				<SectionCard
					title="Ledger"
					description={data.meta ? `${data.meta.total} payment${data.meta.total === 1 ? "" : "s"}` : undefined}
				>
					<AdminPaymentsTable items={data.items} onAction={(action, payment) => setDialog({ action, payment })} />
				</SectionCard>
				<SimplePagination page={page} totalPages={data.meta?.totalPages ?? 1} onChange={setPage} className="mt-4" />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<PageHeader
				title="Payments"
				description="Every payment across WifiSpace, including cash and bank transfers."
				actions={
					<Button onClick={() => setRecording(true)}>
						<Plus />
						Record payment
					</Button>
				}
			/>

			<div className="flex flex-col gap-3 sm:flex-row">
				<div className="relative min-w-52 flex-1">
					<Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Search by reference"
						aria-label="Search payments"
						className="pl-9"
					/>
				</div>
				<FilterSelect value={status} onChange={setStatus} label="Status" allLabel="All statuses" options={PAYMENT_STATUS_OPTIONS} />
			</div>

			{renderBody()}

			{recording && <RecordPaymentDialog onClose={() => setRecording(false)} />}
			{dialog?.action === "details" && <PaymentDetailsDialog payment={dialog.payment} onClose={close} />}
			{dialog?.action === "status" && <UpdateStatusDialog payment={dialog.payment} onClose={close} />}
			{dialog?.action === "reverse" && <ReversePaymentDialog payment={dialog.payment} onClose={close} />}{dialog?.action === "reverse" && <ReversePaymentDialog payment={dialog.payment} onClose={close} />}
		</div>
	);
}
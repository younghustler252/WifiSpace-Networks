"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DetailList } from "@/components/shared/detail-list";
import { Notice } from "@/components/shared/notice";
import { StatusBadge } from "@/components/shared/status-badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { UserNameCell } from "@/features/users/components/user-name-cell";
import { formatCurrency, formatDateTime, humanize } from "@/lib/format";
import { SETTABLE_STATUS_OPTIONS } from "../constants";
import { useUpdatePaymentStatus } from "../hooks/use-payments";
import { paymentDateOf, paymentDiscount, paymentTotal } from "../lib/payment-helpers";
import type { AdminPayment, SettablePaymentStatus } from "../types/payments.types";

interface PaymentDialogProps {
	payment: AdminPayment;
	onClose: () => void;
}

export function PaymentDetailsDialog({ payment, onClose }: PaymentDialogProps) {
	const date = paymentDateOf(payment);
	const discount = paymentDiscount(payment);
	const note = typeof payment.metadata?.note === "string" ? payment.metadata.note : null;

	const rows = [
		{ label: "Reference", value: <span className="text-mono text-[12px]">{payment.gatewayReference}</span> },
		{ label: "Customer", value: <UserNameCell userId={payment.userId} /> },
		{ label: "Amount", value: <span className="text-mono">{formatCurrency(paymentTotal(payment))}</span> },
		...(discount > 0 ? [{ label: "Discount", value: formatCurrency(discount) }] : []),
		{ label: "Method", value: humanize(payment.paymentChannel ?? payment.gateway) },
		{ label: "Status", value: <StatusBadge status={payment.status} /> },
		{ label: "Date", value: date ? formatDateTime(date) : "—" },
		...(payment.cycles ? [{ label: "Cycles", value: String(payment.cycles) }] : []),
		...(payment.actionType ? [{ label: "Type", value: humanize(payment.actionType) }] : []),
		{ label: "Plan activated", value: payment.businessProcessed ? "Yes" : "No" },
		...(payment.failureReason ? [{ label: "Failure reason", value: payment.failureReason }] : []),
		...(note ? [{ label: "Note", value: note }] : []),
	];

	return (
		<Dialog open onOpenChange={(open) => !open && onClose()}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Payment details</DialogTitle>
					<DialogDescription>Everything we have on this payment.</DialogDescription>
				</DialogHeader>
				<DetailList rows={rows} />
			</DialogContent>
		</Dialog>
	);
}

export function UpdateStatusDialog({ payment, onClose }: PaymentDialogProps) {
	const update = useUpdatePaymentStatus();
	const [status, setStatus] = useState<SettablePaymentStatus | "">("");
	const [reason, setReason] = useState("");
	const marksPaid = status === "successful";

	return (
		<ConfirmDialog
			open
			onOpenChange={(open) => !open && onClose()}
			title="Update payment status"
			description={`Reference ${payment.gatewayReference} is ${payment.status}. Only change it once you've verified what really happened.`}
			confirmLabel="Update status"
			confirmDisabled={!status}
			requireText={marksPaid ? "confirm" : undefined}
			onConfirm={async () => {
				if (!status) return false;
				const res = await update.mutateAsync({ id: payment.id, body: { status, reason: reason.trim() || undefined } });
				if (!res.success) {
					toast.error(res.message);
					return false;
				}
				toast.success("Payment updated");
			}}
		>
			<Select value={status} onValueChange={(value) => setStatus(value as SettablePaymentStatus)}>
				<SelectTrigger className="w-full" aria-label="New status">
					<SelectValue placeholder="Choose a status" />
				</SelectTrigger>
				<SelectContent>
					{SETTABLE_STATUS_OPTIONS.map((option) => (
						<SelectItem key={option.value} value={option.value}>
							{option.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>

			{marksPaid && (
				<Notice
					tone="warning"
					title="This activates the customer's plan"
					text="Do this only after you've confirmed the money in your Paystack dashboard or bank account."
				/>
			)}

			<Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason (optional)" aria-label="Reason" />
		</ConfirmDialog>
	);
}
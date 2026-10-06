"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DetailList } from "@/components/shared/detail-list";
import { Notice } from "@/components/shared/notice";
import { StatusBadge } from "@/components/shared/status-badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency, formatDateTime, humanize } from "@/lib/format";
import { SETTABLE_STATUS_OPTIONS } from "../constants";
import { useAdminPaymentDetail, useUpdatePaymentStatus } from "../hooks/use-payments";
import { getProvisioning, paymentDateOf, paymentDiscount, paymentTotal } from "../lib/payment-helpers";
import { PayerCell } from "./payer-cell";
import type { AdminPayment, SettablePaymentStatus } from "../types/payments.types";

interface PaymentDialogProps {
	payment: AdminPayment;
	onClose: () => void;
}

export function PaymentDetailsDialog({ payment, onClose }: PaymentDialogProps) {
	const detail = useAdminPaymentDetail(payment.id);
	const full = detail.data?.payment ?? payment;
	const router = detail.data?.router ?? null;
	const provisioning = getProvisioning(full);
	const date = paymentDateOf(full);
	const discount = paymentDiscount(full);
	const note = typeof full.metadata?.note === "string" ? full.metadata.note : null;

	const routerLabel = router
		? [router.name, router.location].filter(Boolean).join(" · ")
		: detail.isLoading && provisioning?.routerId
			? "Loading…"
			: provisioning?.routerId
				? `…${provisioning.routerId.slice(-6)}`
				: null;

	const rows = [
		{ label: "Reference", value: <span className="text-mono text-[12px]">{full.gatewayReference}</span> },
		{ label: "Customer", value: <PayerCell payment={full} /> },
		...(full.account?.wsnId ? [{ label: "Account", value: <span className="text-mono">{full.account.wsnId}</span> }] : []),
		...(full.plan?.name ? [{ label: "Plan", value: full.plan.name }] : []),
		{ label: "Amount", value: <span className="text-mono">{formatCurrency(paymentTotal(full))}</span> },
		...(discount > 0 ? [{ label: "Discount", value: formatCurrency(discount) }] : []),
		{ label: "Method", value: humanize(full.paymentChannel ?? full.gateway) },
		{ label: "Status", value: <StatusBadge status={full.status} /> },
		{ label: "Date", value: date ? formatDateTime(date) : "—" },
		...(full.cycles ? [{ label: "Cycles", value: String(full.cycles) }] : []),
		...(full.actionType ? [{ label: "Type", value: humanize(full.actionType) }] : []),
		{ label: "Plan activated", value: full.businessProcessed ? "Yes" : "No" },
		...(routerLabel ? [{ label: "Paid at", value: routerLabel }] : []),
		...(provisioning?.macAddress ? [{ label: "Device", value: <span className="text-mono">{provisioning.macAddress}</span> }] : []),
		...(provisioning?.ipAddress ? [{ label: "IP address", value: <span className="text-mono">{provisioning.ipAddress}</span> }] : []),
		...(full.failureReason ? [{ label: "Failure reason", value: full.failureReason }] : []),
		...(note ? [{ label: "Note", value: note }] : []),
		...(full.subscriptionId
			? [
					{
						label: "Subscription",
						value: (
							<Link href={`/admin/subscriptions/${full.subscriptionId}`} className="text-signal hover:underline" onClick={onClose}>
								View subscription →
							</Link>
						),
					},
				]
			: []),
	];

	return (
		<Dialog open onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="max-h-[90svh] overflow-y-auto">
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

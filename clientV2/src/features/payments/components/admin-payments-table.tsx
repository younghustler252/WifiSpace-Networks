import { MoreHorizontal } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserNameCell } from "@/features/users/components/user-name-cell";
import { formatCurrency, formatDateTime, humanize } from "@/lib/format";
import { isSettlable, paymentDateOf, paymentTotal } from "../lib/payment-helpers";
import type { AdminPayment } from "../types/payments.types";

export type PaymentAction = "details" | "status";

interface AdminPaymentsTableProps {
	items: AdminPayment[];
	onAction: (action: PaymentAction, payment: AdminPayment) => void;
}

function RowMenu({ payment, onAction }: { payment: AdminPayment; onAction: (action: PaymentAction) => void }) {
	return (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon" aria-label={`Actions for ${payment.gatewayReference}`}>
					<MoreHorizontal className="size-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-44">
				<DropdownMenuItem onSelect={() => onAction("details")}>View details</DropdownMenuItem>
				{isSettlable(payment) && <DropdownMenuItem onSelect={() => onAction("status")}>Update status…</DropdownMenuItem>}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

const dateLabel = (payment: AdminPayment) => {
	const date = paymentDateOf(payment);
	return date ? formatDateTime(date) : "—";
};

export function AdminPaymentsTable({ items, onAction }: AdminPaymentsTableProps) {
	return (
		<>
			<div className="hidden md:block">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Date</TableHead>
							<TableHead>Customer</TableHead>
							<TableHead>Reference</TableHead>
							<TableHead>Method</TableHead>
							<TableHead className="text-right">Amount</TableHead>
							<TableHead className="text-right">Status</TableHead>
							<TableHead className="w-12" />
						</TableRow>
					</TableHeader>
					<TableBody>
						{items.map((payment) => (
							<TableRow key={payment.id}>
								<TableCell className="whitespace-nowrap text-[13px] text-muted-foreground">{dateLabel(payment)}</TableCell>
								<TableCell className="max-w-56">
									<UserNameCell userId={payment.userId} />
								</TableCell>
								<TableCell className="text-mono max-w-40 truncate text-[12px] text-muted-foreground">{payment.gatewayReference}</TableCell>
								<TableCell className="text-[13px]">{humanize(payment.paymentChannel ?? payment.gateway)}</TableCell>
								<TableCell className="text-mono text-right text-[13px]">{formatCurrency(paymentTotal(payment))}</TableCell>
								<TableCell className="text-right">
									<StatusBadge status={payment.status} />
								</TableCell>
								<TableCell className="text-right">
									<RowMenu payment={payment} onAction={(a) => onAction(a, payment)} />
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			<ul className="divide-y md:hidden">
				{items.map((payment) => (
					<li key={payment.id} className="flex items-center gap-2 py-3 first:pt-0 last:pb-0">
						<div className="min-w-0 flex-1 space-y-1.5">
							<UserNameCell userId={payment.userId} />
							<p className="text-mono text-[13px]">{formatCurrency(paymentTotal(payment))}</p>
							<p className="text-[11px] text-muted-foreground">
								{dateLabel(payment)} · {humanize(payment.paymentChannel ?? payment.gateway)}
							</p>
							<StatusBadge status={payment.status} />
						</div>
						<RowMenu payment={payment} onAction={(a) => onAction(a, payment)} />
					</li>
				))}
			</ul>
		</>
	);
}
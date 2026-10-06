import Link from "next/link";
import { StatusBadge } from "@/components/shared/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserNameCell } from "@/features/users/components/user-name-cell";
import { formatCurrency, formatDate } from "@/lib/format";
import { getDisplayStatus, type SubscriptionAction } from "../lib/subscription-phase";
import type { Subscription } from "../types/subscriptions.types";
import { SubscriptionActionsMenu } from "./subscription-actions-menu";

interface AdminSubscriptionsTableProps {
	items: Subscription[];
	onAction: (action: SubscriptionAction, subscription: Subscription) => void;
}

const expiry = (s: Subscription) => (s.expiresAt ? formatDate(s.expiresAt) : "—");
const planLabel = (s: Subscription) => `${s.planSnapshot.name}${s.cycles > 1 ? ` × ${s.cycles}` : ""}`;

export function AdminSubscriptionsTable({ items, onAction }: AdminSubscriptionsTableProps) {
	return (
		<>
			<div className="hidden md:block">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Customer</TableHead>
							<TableHead>Plan</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Expires</TableHead>
							<TableHead className="w-12" />
						</TableRow>
					</TableHeader>
					<TableBody>
						{items.map((s) => (
							<TableRow key={s.id}>
								<TableCell className="max-w-56">
									<UserNameCell userId={s.userId} />
								</TableCell>
								<TableCell>
									<Link href={`/admin/subscriptions/${s.id}`} className="text-[13px] font-medium hover:text-signal">
										{planLabel(s)}
									</Link>
									<p className="text-mono text-[11px] text-muted-foreground">{formatCurrency(s.totalAmount)}</p>
								</TableCell>
								<TableCell>
									<StatusBadge status={getDisplayStatus(s)} />
								</TableCell>
								<TableCell className="whitespace-nowrap text-[13px] text-muted-foreground">{expiry(s)}</TableCell>
								<TableCell className="text-right">
									<SubscriptionActionsMenu subscription={s} onAction={(a) => onAction(a, s)} />
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			<ul className="divide-y md:hidden">
				{items.map((s) => (
					<li key={s.id} className="flex items-center gap-2 py-3 first:pt-0 last:pb-0">
						<div className="min-w-0 flex-1 space-y-1.5">
							<UserNameCell userId={s.userId} />
							<Link href={`/admin/subscriptions/${s.id}`} className="text-[13px] font-medium hover:text-signal">
								{planLabel(s)}
							</Link>
							<p className="text-[11px] text-muted-foreground">Expires {expiry(s)}</p>
							<StatusBadge status={getDisplayStatus(s)} />
						</div>
						<SubscriptionActionsMenu subscription={s} onAction={(a) => onAction(a, s)} />
					</li>
				))}
			</ul>
		</>
	);
}
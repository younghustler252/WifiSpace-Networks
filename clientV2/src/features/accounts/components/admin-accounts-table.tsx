import Link from "next/link";
import { StatusBadge } from "@/components/shared/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/format";
import { getAccountTitle } from "../lib/account-meta";
import type { AdminAccount } from "../types/accounts.types";
import { AccountActionsMenu, type AccountAction } from "./account-actions-menu";
import { OwnerCell } from "./owner-cell";

interface AdminAccountsTableProps {
	items: AdminAccount[];
	onAction: (action: AccountAction, account: AdminAccount) => void;
}

export function AdminAccountsTable({ items, onAction }: AdminAccountsTableProps) {
	return (
		<>
			<div className="hidden md:block">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Owner</TableHead>
							<TableHead>Account</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Approval</TableHead>
							<TableHead>Created</TableHead>
							<TableHead className="w-12" />
						</TableRow>
					</TableHeader>
					<TableBody>
						{items.map((account) => (
							<TableRow key={account.id}>
								<TableCell className="max-w-64">
									<OwnerCell account={account} />
								</TableCell>
								<TableCell>
									<Link href={`/admin/accounts/${account.id}`} className="text-mono text-[13px] hover:text-signal">
										{account.wsnId}
									</Link>
									<p className="text-[11px] text-muted-foreground">{getAccountTitle(account)}</p>
								</TableCell>
								<TableCell>
									<StatusBadge status={account.status} />
								</TableCell>
								<TableCell>
									<StatusBadge status={account.approvalStatus} />
								</TableCell>
								<TableCell className="whitespace-nowrap text-[13px] text-muted-foreground">{formatDate(account.createdAt)}</TableCell>
								<TableCell className="text-right">
									<AccountActionsMenu account={account} onAction={(a) => onAction(a, account)} />
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			<ul className="divide-y md:hidden">
				{items.map((account) => (
					<li key={account.id} className="relative flex items-center gap-2 py-3 first:pt-0 last:pb-0">
						<Link href={`/admin/accounts/${account.id}`} className="min-w-0 flex-1 space-y-2 rounded-lg py-1 active:bg-muted/50" aria-label={`Open account ${account.wsnId}`}>
							<OwnerCell account={account} />
							<p className="text-[12px] text-muted-foreground">
								<span className="text-mono font-medium text-foreground underline decoration-signal/50 underline-offset-4">{account.wsnId}</span> · {getAccountTitle(account)}
							</p>
							<div className="flex flex-wrap items-center gap-2">
								<StatusBadge status={account.status} />
								<StatusBadge status={account.approvalStatus} />
							</div>
						</Link>
						<AccountActionsMenu account={account} onAction={(a) => onAction(a, account)} />
					</li>
				))}
			</ul>
		</>
	);
}
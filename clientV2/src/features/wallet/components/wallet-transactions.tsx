import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { txSourceLabel } from "../constants";
import { formatWalletAmount } from "../lib/money";
import type { WalletTransaction } from "../types/wallet.types";

export function WalletTransactionList({ items }: { items: WalletTransaction[] }) {
	return (
		<ul className="divide-y">
			{items.map((tx) => {
				const credit = tx.type === "credit";
				const Icon = credit ? ArrowDownLeft : ArrowUpRight;

				return (
					<li key={tx.reference} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
						<span className={cn("flex size-9 shrink-0 items-center justify-center rounded-full", credit ? "bg-success-soft text-success" : "bg-accent text-muted-foreground")}>
							<Icon className="size-4" />
						</span>
						<div className="min-w-0 flex-1">
							<p className="truncate text-sm font-medium">{txSourceLabel(tx.source)}</p>
							<p className="truncate text-[12px] text-muted-foreground">{tx.description ?? formatDateTime(tx.createdAt)}</p>
							{tx.description && <p className="text-[11px] text-muted-foreground">{formatDateTime(tx.createdAt)}</p>}
						</div>
						<div className="shrink-0 text-right">
							<p className={cn("text-mono text-sm", credit && "text-success")}>
								{credit ? "+" : "−"}
								{formatWalletAmount(tx.amount)}
							</p>
							{tx.balanceAfter !== null && <p className="text-mono text-[11px] text-muted-foreground">Bal {formatWalletAmount(tx.balanceAfter)}</p>}
						</div>
					</li>
				);
			})}
		</ul>
	);
}

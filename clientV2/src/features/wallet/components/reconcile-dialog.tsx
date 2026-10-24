"use client";

import { useState } from "react";
import { Loader2, SearchCheck } from "lucide-react";
import { toast } from "sonner";
import { Field } from "@/components/shared/field";
import { Notice } from "@/components/shared/notice";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { settleFailure } from "@/lib/api/failure";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useReconcileWallets } from "../hooks/use-wallet";
import { formatWalletAmount } from "../lib/money";
import type { ReconcileResult, ReconcileRowStatus } from "../types/reconcile.types";

const STATUS_STYLE: Record<ReconcileRowStatus, { label: string; className: string }> = {
	already_credited: { label: "Already credited", className: "bg-accent text-muted-foreground" },
	would_credit: { label: "Would credit", className: "bg-warning-soft text-warning" },
	credited: { label: "Credited", className: "bg-success-soft text-success" },
	unmatched: { label: "No wallet found", className: "bg-destructive/10 text-destructive" },
};

export function ReconcileDialog({ onClose }: { onClose: () => void }) {
	const reconcile = useReconcileWallets();
	const [days, setDays] = useState("7");
	const [error, setError] = useState<string | null>(null);
	const [result, setResult] = useState<ReconcileResult | null>(null);
	const [applied, setApplied] = useState(false);

	function readDays() {
		const value = Number(days);
		if (!Number.isInteger(value) || value < 1 || value > 60) {
			setError("Enter a whole number from 1 to 60");
			return null;
		}
		return value;
	}

	async function run(apply: boolean) {
		const value = readDays();
		if (value === null) return;

		const res = await reconcile.mutateAsync({ days: value, apply });

		if (!res.success) {
			if (settleFailure(res, "The check")) onClose();
			return;
		}

		setResult(res.data);
		setApplied(apply);
		if (apply) toast.success(`${res.data.summary.credited} transfer${res.data.summary.credited === 1 ? "" : "s"} credited`);
	}

	const summary = result?.summary;
	const visibleRows = (result?.rows ?? []).filter((r) => r.status !== "already_credited");

	return (
		<Dialog open onOpenChange={(open) => !open && !reconcile.isPending && onClose()}>
			<DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-xl">
				<DialogHeader>
					<DialogTitle>Check for missing top-ups</DialogTitle>
					<DialogDescription>
						Finds bank transfers Paystack received that never reached a wallet. This also runs automatically every 15 minutes. Crediting is safe to repeat.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					<div className="flex items-end gap-3">
						<div className="flex-1">
							<Field label="Look back (days)" htmlFor="reconcile-days" error={error ?? undefined}>
								<Input
									id="reconcile-days"
									type="number"
									inputMode="numeric"
									min={1}
									max={60}
									value={days}
									aria-invalid={!!error}
									onChange={(e) => {
										setDays(e.target.value);
										setError(null);
										setResult(null);
									}}
								/>
							</Field>
						</div>
						<Button className="h-11" disabled={reconcile.isPending} onClick={() => run(false)}>
							{reconcile.isPending && !applied ? <Loader2 className="animate-spin" /> : <SearchCheck />}
							Check
						</Button>
					</div>

					{summary && (
						<div className="space-y-4">
							<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
								{[
									{ label: "Found", value: summary.found },
									{ label: "Already credited", value: summary.alreadyCredited },
									{ label: applied ? "Credited" : "To credit", value: applied ? summary.credited : summary.wouldCredit },
									{ label: "Unmatched", value: summary.unmatched },
								].map((tile) => (
									<div key={tile.label} className="card-elevated bg-surface-2 p-3">
										<p className="text-[11px] text-muted-foreground">{tile.label}</p>
										<p className="text-mono text-xl font-semibold">{tile.value}</p>
									</div>
								))}
							</div>

							{visibleRows.length === 0 ? (
								<Notice tone="info" title="Nothing missing" text="Every transfer in this period is already in a wallet." />
							) : (
								<ul className="divide-y rounded-lg border">
									{visibleRows.map((row) => {
										const style = STATUS_STYLE[row.status];
										return (
											<li key={row.reference} className="flex items-center justify-between gap-3 p-3">
												<div className="min-w-0">
													<p className="text-mono text-sm">{formatWalletAmount(row.amount)}</p>
													<p className="truncate text-[12px] text-muted-foreground">
														{row.sender ?? "Unknown sender"} · {row.email ?? row.accountNumber ?? "no match"}
													</p>
													{row.paidAt && <p className="text-[11px] text-muted-foreground">{formatDateTime(row.paidAt)}</p>}
												</div>
												<span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium", style.className)}>{style.label}</span>
											</li>
										);
									})}
								</ul>
							)}

							{summary.unmatched > 0 && (
								<Notice tone="warning" title="Some transfers have no wallet" text="Check those in Paystack manually. They can't be credited automatically." />
							)}

							{!applied && summary.wouldCredit > 0 && (
								<Button size="lg" className="w-full" disabled={reconcile.isPending} onClick={() => run(true)}>
									{reconcile.isPending && <Loader2 className="animate-spin" />}
									Credit {summary.wouldCredit} transfer{summary.wouldCredit === 1 ? "" : "s"}
								</Button>
							)}
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}

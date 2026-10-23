"use client";

import { useState } from "react";
import { Loader2, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Field } from "@/components/shared/field";
import { SectionCard } from "@/components/shared/section-card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { settleFailure } from "@/lib/api/failure";
import { useIdempotencyKey } from "@/lib/api/idempotency";
import { WALLET_DIRECTION_OPTIONS } from "../constants";
import { useAdjustWallet, useAdminWallet, useAdminWalletTransactions } from "../hooks/use-wallet";
import { formatWalletAmount } from "../lib/money";
import { WalletTransactionList } from "./wallet-transactions";

function AdjustWalletDialog({ userId, balance, onClose }: { userId: string; balance: number; onClose: () => void }) {
	const adjust = useAdjustWallet(userId);
	const [direction, setDirection] = useState<"credit" | "debit">("credit");
	const [amount, setAmount] = useState("");
	const [reason, setReason] = useState("");
	const [error, setError] = useState<string | null>(null);
	const idempotencyKey = useIdempotencyKey(`${userId}|${direction}|${amount}|${reason}`);

	async function submit() {
		const value = Number(amount);
		if (!Number.isFinite(value) || value <= 0) return setError("Enter an amount greater than zero");
		if (value > 10_000_000) return setError("The most you can adjust at once is ₦10,000,000");
		if (reason.trim().length < 3) return setError("Give a reason of at least 3 characters");
		if (direction === "debit" && value > balance) return setError("That's more than the wallet currently holds");

		const res = await adjust.mutateAsync({ direction, amount: value, reason: reason.trim(), idempotencyKey });

		if (!res.success) {
			if (settleFailure(res, "The adjustment")) onClose();
			return;
		}

		toast.success(direction === "credit" ? "Money added to the wallet" : "Money removed from the wallet", {
			description: `New balance ${formatWalletAmount(res.data.balance)}`,
		});
		onClose();
	}

	return (
		<Dialog open onOpenChange={(open) => !open && !adjust.isPending && onClose()}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Adjust wallet</DialogTitle>
					<DialogDescription>Current balance {formatWalletAmount(balance)}. This is recorded in the audit log with your name.</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					<Field label="Action" htmlFor="adjust-direction">
						<Select value={direction} onValueChange={(v) => setDirection(v as "credit" | "debit")}>
							<SelectTrigger id="adjust-direction" className="w-full">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{WALLET_DIRECTION_OPTIONS.map((o) => (
									<SelectItem key={o.value} value={o.value}>
										{o.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</Field>
					<Field label="Amount (₦)" htmlFor="adjust-amount">
						<Input id="adjust-amount" type="number" inputMode="decimal" min={0} value={amount} onChange={(e) => setAmount(e.target.value)} />
					</Field>
					<Field label="Reason" htmlFor="adjust-reason" hint="The customer sees this on their wallet activity.">
						<Textarea id="adjust-reason" value={reason} maxLength={200} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Goodwill credit for the outage on 20 Oct" />
					</Field>

					{error && (
						<p role="alert" className="text-sm text-destructive">
							{error}
						</p>
					)}

					<Button size="lg" className="w-full" disabled={adjust.isPending} onClick={submit}>
						{adjust.isPending && <Loader2 className="animate-spin" />}
						Apply adjustment
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}

export function AdminWalletCard({ userId }: { userId: string }) {
	const wallet = useAdminWallet(userId);
	const transactions = useAdminWalletTransactions(userId, 1, 5);
	const [open, setOpen] = useState(false);

	const items = transactions.data?.items ?? [];

	return (
		<SectionCard
			title="Wallet"
			actions={
				wallet.data && (
					<Button size="sm" variant="outline" className="bg-surface-2" onClick={() => setOpen(true)}>
						<SlidersHorizontal />
						Adjust
					</Button>
				)
			}
		>
			{wallet.isLoading && <Skeleton className="h-24 rounded-lg" />}
			{wallet.isError && (
				<div className="space-y-3 text-center text-sm">
					<p>We couldn&apos;t load this wallet.</p>
					<Button variant="outline" onClick={() => wallet.refetch()}>
						Try again
					</Button>
				</div>
			)}
			{wallet.data && (
				<div className="space-y-4">
					<div>
						<p className="text-[11px] uppercase tracking-wider text-muted-foreground">Balance</p>
						<p className="text-mono text-2xl font-semibold">{formatWalletAmount(wallet.data.balance)}</p>
						{wallet.data.virtualAccount?.accountNumber && (
							<p className="mt-1 text-[12px] text-muted-foreground">
								<span className="text-mono">{wallet.data.virtualAccount.accountNumber}</span> · {wallet.data.virtualAccount.bankName}
							</p>
						)}
					</div>
					{items.length > 0 ? <WalletTransactionList items={items} /> : <p className="text-[12px] text-muted-foreground">No wallet activity yet.</p>}
				</div>
			)}
			{open && wallet.data && <AdjustWalletDialog userId={userId} balance={wallet.data.balance} onClose={() => setOpen(false)} />}
		</SectionCard>
	);
}

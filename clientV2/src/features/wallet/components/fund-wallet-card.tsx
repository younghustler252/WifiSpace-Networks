"use client";

import { Copy, Landmark, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { SectionCard } from "@/components/shared/section-card";
import { Button } from "@/components/ui/button";
import { useCreateVirtualAccount } from "../hooks/use-wallet";
import type { Wallet } from "../types/wallet.types";

function CopyRow({ label, value, mono, copyable }: { label: string; value: string; mono?: boolean; copyable?: boolean }) {
	async function copy() {
		try {
			await navigator.clipboard.writeText(value);
			toast.success(`${label} copied`);
		} catch {
			toast.error("Couldn't copy. Select and copy it manually.");
		}
	}

	return (
		<div className="flex items-center justify-between gap-3 py-2.5">
			<div className="min-w-0">
				<p className="text-[11px] text-muted-foreground">{label}</p>
				<p className={mono ? "text-mono truncate text-lg" : "truncate text-sm font-medium"}>{value}</p>
			</div>
			{copyable && (
				<Button variant="outline" size="icon" className="bg-surface-2" onClick={copy} aria-label={`Copy ${label.toLowerCase()}`}>
					<Copy className="size-4" />
				</Button>
			)}
		</div>
	);
}

export function FundWalletCard({ wallet }: { wallet: Wallet }) {
	const create = useCreateVirtualAccount();
	const account = wallet.virtualAccount;
	const ready = !!account?.accountNumber;

	async function setup() {
		const res = await create.mutateAsync();
		if (!res.success) toast.error(res.message);
	}

	return (
		<SectionCard title="Add money" description="Transfer from any bank app. It reaches your wallet automatically.">
			{ready && account ? (
				<div className="space-y-3">
					<div className="divide-y">
						<CopyRow label="Account number" value={account.accountNumber!} mono copyable />
						{account.bankName && <CopyRow label="Bank" value={account.bankName} />}
						{account.accountName && <CopyRow label="Account name" value={account.accountName} />}
					</div>
					<p className="text-[12px] text-muted-foreground">
						This number is yours alone. Send any amount, any time. Your balance updates within a minute or two of the transfer.
					</p>
				</div>
			) : (
				<div className="space-y-4 text-center">
					<div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-accent text-signal">
						<Landmark className="size-6" />
					</div>
					<p className="mx-auto max-w-xs text-sm text-muted-foreground">
						Get your own bank account number. Anything you send to it lands in this wallet.
					</p>
					<Button size="lg" className="w-full sm:w-auto" disabled={create.isPending} onClick={setup}>
						{create.isPending && <Loader2 className="animate-spin" />}
						Get my account number
					</Button>
				</div>
			)}
		</SectionCard>
	);
}

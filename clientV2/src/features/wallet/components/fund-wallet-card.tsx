"use client";

import { useState } from "react";
import { Copy, Landmark, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Field } from "@/components/shared/field";
import { SectionCard } from "@/components/shared/section-card";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth.store";
import { Input } from "@/components/ui/input";
import { WALLET_ERROR_CODES } from "../constants";
import { normalizePhone } from "../lib/money";
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
	const savedPhone = useAuthStore((s) => (s.user as { phone?: string | null } | null)?.phone);
	const [needsPhone, setNeedsPhone] = useState(!savedPhone);
	const [phone, setPhone] = useState("");
	const [phoneError, setPhoneError] = useState<string | null>(null);
	const account = wallet.virtualAccount;
	const ready = !!account?.accountNumber;

	async function setup() {
		let value: string | undefined;

		if (needsPhone) {
			const normalized = normalizePhone(phone);
			if (!normalized) {
				setPhoneError("Enter a phone number with 10 to 15 digits");
				return;
			}
			value = normalized;
		}

		const res = await create.mutateAsync(value);

		if (!res.success) {
			const phoneMissing =
				res.code === WALLET_ERROR_CODES.PHONE_REQUIRED ||
				(res.code === WALLET_ERROR_CODES.VIRTUAL_ACCOUNT_FAILED && JSON.stringify(res.details ?? "").toLowerCase().includes("phone"));

			if (phoneMissing) {
				setNeedsPhone(true);
				if (value) toast.error("Your phone number wasn't accepted yet. Please try again shortly or contact support.");
				return;
			}
			toast.error(res.message);
		}
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
					{needsPhone && (
						<div className="mx-auto max-w-xs text-left">
							<Field label="Phone number" htmlFor="wallet-phone" error={phoneError ?? undefined} hint="Your bank needs it to issue the account number. We save it to your profile.">
								<Input
									id="wallet-phone"
									type="tel"
									inputMode="tel"
									autoComplete="tel"
									placeholder="08012345678"
									value={phone}
									aria-invalid={!!phoneError}
									onChange={(e) => {
										setPhone(e.target.value);
										setPhoneError(null);
									}}
								/>
							</Field>
						</div>
					)}
					<Button size="lg" className="w-full sm:w-auto" disabled={create.isPending} onClick={setup}>
						{create.isPending && <Loader2 className="animate-spin" />}
						Get my account number
					</Button>
				</div>
			)}
		</SectionCard>
	);
}

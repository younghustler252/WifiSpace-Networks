"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Wallet as WalletIcon } from "lucide-react";
import { Field } from "@/components/shared/field";
import { Notice } from "@/components/shared/notice";
import { PasswordInput } from "@/components/shared/password-input";
import { Button } from "@/components/ui/button";
import { formatWalletAmount } from "@/features/wallet/lib/money";
import { formatCurrency } from "@/lib/format";
import { hotspotsApi } from "../services/hotspots.api";

interface PortalWalletPanelProps {
	email: string;
	price: number;
	busy: boolean;
	onPay: (password: string) => void;
}

export function PortalWalletPanel({ email, price, busy, onPay }: PortalWalletPanelProps) {
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [balance, setBalance] = useState<number | null>(null);
	const check = useMutation({ mutationFn: hotspotsApi.wallet });

	async function checkBalance() {
		if (!password) {
			setError("Enter your WifiSpace password");
			return;
		}

		const res = await check.mutateAsync({ email, password });

		if (!res.success) {
			setBalance(null);
			setError(res.code === "INVALID_CREDENTIALS" ? "Incorrect email or password" : res.message);
			return;
		}

		setError(null);
		setBalance(res.data.balance);
	}

	const enough = balance !== null && balance >= price;

	return (
		<div className="space-y-4">
			<Field label="WifiSpace password" htmlFor="portal-wallet-password" error={error ?? undefined} hint={`For ${email}. We ask every time so nobody else on this device can spend your balance.`}>
				<PasswordInput
					id="portal-wallet-password"
					autoComplete="current-password"
					value={password}
					aria-invalid={!!error}
					onChange={(e) => {
						setPassword(e.target.value);
						setError(null);
						setBalance(null);
					}}
				/>
			</Field>

			{balance === null ? (
				<Button size="lg" variant="outline" className="w-full bg-surface-2" disabled={check.isPending} onClick={checkBalance}>
					{check.isPending ? <Loader2 className="animate-spin" /> : <WalletIcon />}
					Check my wallet
				</Button>
			) : (
				<div className="space-y-3">
					<div className="card-elevated flex items-center justify-between gap-3 bg-surface-2 p-4">
						<div>
							<p className="text-[11px] uppercase tracking-wider text-muted-foreground">Wallet balance</p>
							<p className="text-mono text-2xl font-semibold">{formatWalletAmount(balance)}</p>
						</div>
						<WalletIcon className="size-6 text-signal" />
					</div>

					{enough ? (
						<Button size="lg" className="w-full" disabled={busy} onClick={() => onPay(password)}>
							{busy && <Loader2 className="animate-spin" />}
							Pay {formatCurrency(price)} from wallet
						</Button>
					) : (
						<Notice
							tone="warning"
							title="Not enough in your wallet"
							text={`You need ${formatWalletAmount(price - balance)} more. Top up from your WifiSpace account, or pay by card instead.`}
						/>
					)}
				</div>
			)}
		</div>
	);
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Notice } from "@/components/shared/notice";
import { SectionCard } from "@/components/shared/section-card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cardLabel } from "@/features/payments/components/saved-cards-card";
import { useSavedCards } from "@/features/payments/hooks/use-payments";
import { formatWalletAmount } from "@/features/wallet/lib/money";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { SUBSCRIPTION_ERROR_CODES } from "../constants";
import { useAutoRenew } from "../hooks/use-subscriptions";
import type { AutoRenewMethod, AutoRenewResult, Subscription } from "../types/subscriptions.types";

const METHODS: { value: AutoRenewMethod; title: string; text: string }[] = [
	{ value: "wallet", title: "Wallet", text: "Take it from your wallet balance" },
	{ value: "card", title: "Saved card", text: "Charge your saved card" },
	{ value: "wallet_then_card", title: "Wallet, then card", text: "Wallet first. Card if the wallet is short" },
];

const METHOD_LABEL: Record<AutoRenewMethod, string> = { wallet: "your wallet", card: "your saved card", wallet_then_card: "your wallet, then your saved card" };

interface AutoRenewCardProps {
	subscription: Subscription;
	admin?: boolean;
}

export function AutoRenewCard({ subscription, admin = false }: AutoRenewCardProps) {
	const autoRenew = useAutoRenew(admin);
	const cards = useSavedCards(!admin);
	const [info, setInfo] = useState<AutoRenewResult | null>(null);
	const [method, setMethod] = useState<AutoRenewMethod>(subscription.autoRenewMethod ?? "wallet");
	const [cardId, setCardId] = useState<string | null>(subscription.autoRenewCardId ?? null);

	if (subscription.status !== "active") return null;

	const enabled = info?.autoRenewEnabled ?? subscription.autoRenewEnabled;
	const activeMethod = (info?.method ?? subscription.autoRenewMethod ?? method) as AutoRenewMethod;
	const next = info?.nextRenewalDate ?? subscription.nextRenewalDate ?? null;
	const usableCards = (cards.data ?? []).filter((c) => !c.expired);
	const hasCard = usableCards.length > 0;
	const lastError = info ? info.lastError : subscription.lastAutoRenewError;
	const shortfall = info?.walletShortfall ?? 0;
	const methods = admin ? METHODS.filter((m) => m.value === "wallet") : METHODS;

	async function save(body: { enabled: boolean; method?: AutoRenewMethod; cardId?: string | null }) {
		const res = await autoRenew.mutateAsync({ id: subscription.id, body });

		if (!res.success) {
			if (res.code === SUBSCRIPTION_ERROR_CODES.NO_SAVED_CARD || res.code === SUBSCRIPTION_ERROR_CODES.CARD_EXPIRED || res.code === SUBSCRIPTION_ERROR_CODES.SUBSCRIPTION_NOT_ACTIVE) {
				toast.error(res.message);
				return false;
			}
			toast.error(res.message);
			return false;
		}

		setInfo(res.data);
		if (res.data.method) setMethod(res.data.method);
		setCardId(res.data.cardId);
		return true;
	}

	async function toggle(next: boolean) {
		const ok = await save(next ? { enabled: true, method, cardId: method === "wallet" ? null : cardId } : { enabled: false });
		if (ok) toast.success(next ? "Auto-renew is on" : "Auto-renew is off");
	}

	async function changeMethod(value: AutoRenewMethod) {
		if (value !== "wallet" && !hasCard) {
			toast.error("Save a card first by paying once with your card.");
			return;
		}
		setMethod(value);
		if (enabled) {
			const ok = await save({ enabled: true, method: value, cardId: value === "wallet" ? null : cardId });
			if (ok) toast.success("Auto-renew method updated");
		}
	}

	return (
		<SectionCard
			title="Auto-renew"
			description="Renews about an hour before the plan ends, so there's no gap."
			actions={
				<div className="flex items-center gap-2">
					{autoRenew.isPending && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
					<Switch checked={enabled} disabled={autoRenew.isPending} onCheckedChange={toggle} aria-label="Turn auto-renew on or off" />
				</div>
			}
		>
			<div className="space-y-4">
				{enabled ? (
					<p className="text-sm">
						<RefreshCw className="mr-1.5 inline size-3.5 text-signal" />
						{next ? `Renews on ${formatDateTime(next)}` : "Renews before it expires"}
						{info ? ` for ${formatWalletAmount(info.renewalPrice)}` : ""} from {METHOD_LABEL[activeMethod]}.
					</p>
				) : (
					<p className="text-[13px] text-muted-foreground">Off. {admin ? "The customer renews by hand, or you can switch it on for them." : "Turn it on and we renew for you before it runs out."}</p>
				)}

				{enabled && shortfall > 0 && activeMethod === "wallet" && (
					<Notice
						tone="warning"
						title={`Top up ${formatWalletAmount(shortfall)} to stay connected`}
						text={admin ? "The customer's wallet doesn't cover the next renewal." : "Your wallet doesn't cover the next renewal yet."}
					/>
				)}
				{!admin && enabled && shortfall > 0 && activeMethod === "wallet" && (
					<Button asChild className="w-full">
						<Link href="/wallet">Top up wallet</Link>
					</Button>
				)}

				{lastError && <Notice tone="danger" title="The last automatic renewal didn't work" text={lastError} />}

				{(enabled || methods.length > 1) && (
					<div role="radiogroup" aria-label="Auto-renew method" className="space-y-2">
						{methods.map((m) => {
							const disabled = autoRenew.isPending || (m.value !== "wallet" && !hasCard);

							return (
								<button
									key={m.value}
									type="button"
									role="radio"
									aria-checked={method === m.value}
									disabled={disabled}
									onClick={() => changeMethod(m.value)}
									className={cn(
										"flex min-h-14 w-full flex-col justify-center rounded-lg border p-3 text-left transition disabled:opacity-50",
										method === m.value ? "border-signal bg-accent" : "bg-surface-2 hover:border-signal/40"
									)}
								>
									<span className="text-sm font-medium">{m.title}</span>
									<span className="text-[12px] text-muted-foreground">{m.value !== "wallet" && !hasCard ? "Pay once by card to save one" : m.text}</span>
								</button>
							);
						})}
					</div>
				)}

				{!admin && method !== "wallet" && usableCards.length > 1 && (
					<div className="space-y-2">
						<p className="text-[11px] uppercase tracking-wider text-muted-foreground">Card to use</p>
						<div className="flex flex-wrap gap-2">
							{usableCards.map((card) => (
								<Button
									key={card.id}
									variant={cardId === card.id ? "default" : "outline"}
									size="sm"
									className={cardId === card.id ? undefined : "bg-surface-2"}
									disabled={autoRenew.isPending}
									onClick={async () => {
										setCardId(card.id);
										if (enabled) await save({ enabled: true, method, cardId: card.id });
									}}
								>
									{cardLabel(card)}
								</Button>
							))}
						</div>
					</div>
				)}
			</div>
		</SectionCard>
	);
}

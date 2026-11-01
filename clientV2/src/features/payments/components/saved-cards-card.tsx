"use client";

import { useState } from "react";
import { CreditCard, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { settleFailure } from "@/lib/api/failure";
import { useCardActions, useSavedCards } from "../hooks/use-payments";
import type { SavedCard } from "../types/payments.types";

export const cardLabel = (card: Pick<SavedCard, "brand" | "last4">) => `${card.brand ? card.brand[0].toUpperCase() + card.brand.slice(1) : "Card"} ending ${card.last4}`;

export function SavedCardsCard() {
	const cards = useSavedCards();
	const { setDefault, remove } = useCardActions();
	const [removing, setRemoving] = useState<SavedCard | null>(null);

	async function makeDefault(card: SavedCard) {
		const res = await setDefault.mutateAsync(card.id);
		if (res.success) toast.success(`${cardLabel(card)} is now your default`);
		else toast.error(res.message);
	}

	function renderBody() {
		if (cards.isLoading) return <Skeleton className="h-20 rounded-lg" />;
		if (cards.isError) {
			return (
				<div className="space-y-3 text-sm">
					<p>We couldn&apos;t load your saved cards.</p>
					<Button variant="outline" onClick={() => cards.refetch()}>
						Try again
					</Button>
				</div>
			);
		}
		if (!cards.data || cards.data.length === 0) {
			return <p className="text-[13px] text-muted-foreground">No saved cards yet. After you pay by card, we keep it here if your bank allows. Only the last 4 digits are stored.</p>;
		}

		return (
			<ul className="divide-y">
				{cards.data.map((card) => (
					<li key={card.id} className="flex flex-col gap-3 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
						<div className="flex min-w-0 items-center gap-3">
							<span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-signal">
								<CreditCard className="size-4" />
							</span>
							<div className="min-w-0">
								<p className="truncate text-sm font-medium">{cardLabel(card)}</p>
								<p className="text-[12px] text-muted-foreground">
									Expires {card.expMonth}/{card.expYear}
									{card.bank ? ` · ${card.bank}` : ""}
								</p>
							</div>
						</div>
						<div className="flex shrink-0 flex-wrap items-center gap-2">
							{card.isDefault && <StatusBadge tone="info" label="Default" />}
							{card.expired && <StatusBadge tone="danger" label="Expired" />}
							{!card.isDefault && !card.expired && (
								<Button variant="outline" size="sm" className="bg-surface-2" disabled={setDefault.isPending} onClick={() => makeDefault(card)}>
									<Star />
									Make default
								</Button>
							)}
							<Button variant="outline" size="sm" className="bg-surface-2 text-destructive" onClick={() => setRemoving(card)}>
								<Trash2 />
								Remove
							</Button>
						</div>
					</li>
				))}
			</ul>
		);
	}

	return (
		<SectionCard title="Saved cards" description="Used for one-tap payments and card auto-renew.">
			{renderBody()}
			{removing && (
				<ConfirmDialog
					open
					destructive
					onOpenChange={(open) => !open && setRemoving(null)}
					title={`Remove ${cardLabel(removing)}?`}
					description="Plans that auto-renew with this card fall back to your wallet. If it was the only method, auto-renew switches off."
					confirmLabel="Remove card"
					onConfirm={async () => {
						const res = await remove.mutateAsync(removing.id);
						if (!res.success) return settleFailure(res, "Removing the card");
						toast.success("Card removed");
					}}
				/>
			)}
		</SectionCard>
	);
}

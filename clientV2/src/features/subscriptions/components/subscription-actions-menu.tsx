"use client";

import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getSubscriptionActions, type SubscriptionAction } from "../lib/subscription-phase";
import type { Subscription } from "../types/subscriptions.types";

const LABELS: Record<SubscriptionAction, string> = {
	extend: "Extend (free days)…",
	renew: "Renew (records payment)…",
	"change-plan": "Change plan…",
	suspend: "Suspend…",
	resume: "Resume",
	cancel: "Cancel…",
	"force-expire": "Force expire…",
	usage: "View usage",
};

const GROUPS: SubscriptionAction[][] = [
	["usage", "extend", "renew"],
	["change-plan", "suspend", "resume"],
	["cancel", "force-expire"],
];

const DESTRUCTIVE = new Set<SubscriptionAction>(["cancel", "force-expire"]);

interface SubscriptionActionsMenuProps {
	subscription: Subscription;
	onAction: (action: SubscriptionAction) => void;
}

export function SubscriptionActionsMenu({ subscription, onAction }: SubscriptionActionsMenuProps) {
	const available = getSubscriptionActions(subscription);
	const groups = GROUPS.map((group) => group.filter((a) => available.includes(a))).filter((group) => group.length > 0);
	if (groups.length === 0) return null;

	return (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon" aria-label={`Actions for ${subscription.planSnapshot.name}`}>
					<MoreHorizontal className="size-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-56">
				{groups.map((group, index) => (
					<div key={group[0]}>
						{index > 0 && <DropdownMenuSeparator />}
						{group.map((action) => (
							<DropdownMenuItem
								key={action}
								className={DESTRUCTIVE.has(action) ? "text-destructive focus:text-destructive" : undefined}
								onSelect={() => onAction(action)}
							>
								{LABELS[action]}
							</DropdownMenuItem>
						))}
					</div>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
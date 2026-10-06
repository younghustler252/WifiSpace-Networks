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
import { approvalOf } from "../lib/account-meta";
import type { AdminAccount } from "../types/accounts.types";

export type AccountAction = "approve" | "reject" | "subscribe" | "record-payment" | "pause" | "suspend" | "resume" | "terminate";

const LABELS: Record<AccountAction, string> = {
	approve: "Approve…",
	reject: "Reject…",
	subscribe: "Create subscription…",
	"record-payment": "Record payment…",
	pause: "Pause…",
	suspend: "Suspend…",
	resume: "Resume",
	terminate: "Terminate…",
};

const MONEY: AccountAction[] = ["subscribe", "record-payment"];

export function getAvailableActions(account: AdminAccount): AccountAction[] {
	const approval = approvalOf(account);
	if (approval === "pending") return ["approve", "reject"];
	if (approval !== "approved") return [];

	const money: AccountAction[] = account.status === "terminated" ? [] : MONEY;

	switch (account.status) {
		case "active":
			return [...money, "pause", "suspend", "terminate"];
		case "paused":
		case "suspended":
			return [...money, "resume", "terminate"];
		default:
			return money;
	}
}

interface AccountActionsMenuProps {
	account: AdminAccount;
	onAction: (action: AccountAction) => void;
}

export function AccountActionsMenu({ account, onAction }: AccountActionsMenuProps) {
	const actions = getAvailableActions(account);
	if (actions.length === 0) return null;

	const money = actions.filter((a) => MONEY.includes(a));
	const rest = actions.filter((a) => !MONEY.includes(a));

	const renderItem = (action: AccountAction) => (
		<DropdownMenuItem
			key={action}
			className={action === "terminate" ? "text-destructive focus:text-destructive" : undefined}
			onSelect={() => onAction(action)}
		>
			{LABELS[action]}
		</DropdownMenuItem>
	);

	return (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon" aria-label={`Actions for ${account.wsnId}`}>
					<MoreHorizontal className="size-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-52">
				{money.map(renderItem)}
				{money.length > 0 && rest.length > 0 && <DropdownMenuSeparator />}
				{rest.map(renderItem)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
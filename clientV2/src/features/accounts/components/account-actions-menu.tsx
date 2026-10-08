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

export type AccountAction = "edit" | "approve" | "reject" | "subscribe" | "record-payment" | "pause" | "suspend" | "resume" | "terminate";

const LABELS: Record<AccountAction, string> = {
	edit: "Edit account…",
	approve: "Approve…",
	reject: "Reject…",
	subscribe: "Create subscription…",
	"record-payment": "Record payment…",
	pause: "Pause…",
	suspend: "Suspend…",
	resume: "Resume",
	terminate: "Terminate…",
};

const FIRST_GROUP: AccountAction[] = ["edit", "subscribe", "record-payment"];

export function getAvailableActions(account: AdminAccount): AccountAction[] {
	const approval = approvalOf(account);
	const terminated = account.status === "terminated";
	const edit: AccountAction[] = terminated ? [] : ["edit"];

	if (approval === "pending") return [...edit, "approve", "reject"];
	if (approval !== "approved") return [];

	const money: AccountAction[] = terminated ? [] : ["subscribe", "record-payment"];

	switch (account.status) {
		case "active":
			return [...edit, ...money, "pause", "suspend", "terminate"];
		case "paused":
		case "suspended":
			return [...edit, ...money, "resume", "terminate"];
		default:
			return [...edit, ...money];
	}
}

interface AccountActionsMenuProps {
	account: AdminAccount;
	onAction: (action: AccountAction) => void;
}

export function AccountActionsMenu({ account, onAction }: AccountActionsMenuProps) {
	const actions = getAvailableActions(account);
	if (actions.length === 0) return null;

	const first = actions.filter((a) => FIRST_GROUP.includes(a));
	const rest = actions.filter((a) => !FIRST_GROUP.includes(a));

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
				{first.map(renderItem)}
				{first.length > 0 && rest.length > 0 && <DropdownMenuSeparator />}
				{rest.map(renderItem)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
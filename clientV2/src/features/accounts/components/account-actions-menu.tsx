"use client";

import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { AdminAccount } from "../types/accounts.types";

export type AccountAction = "approve" | "reject" | "pause" | "suspend" | "resume" | "terminate";

const LABELS: Record<AccountAction, string> = {
	approve: "Approve…",
	reject: "Reject…",
	pause: "Pause…",
	suspend: "Suspend…",
	resume: "Resume",
	terminate: "Terminate…",
};

export function getAvailableActions(account: AdminAccount): AccountAction[] {
	const approval = account.approvalStatus ?? "approved";
	if (approval === "pending") return ["approve", "reject"];
	if (approval !== "approved") return [];

	switch (account.status) {
		case "active":
			return ["pause", "suspend", "terminate"];
		case "paused":
		case "suspended":
			return ["resume", "terminate"];
		default:
			return [];
	}
}

interface AccountActionsMenuProps {
	account: AdminAccount;
	onAction: (action: AccountAction) => void;
}

export function AccountActionsMenu({ account, onAction }: AccountActionsMenuProps) {
	const actions = getAvailableActions(account);
	if (actions.length === 0) return null;

	return (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon" aria-label={`Actions for ${account.wsnId}`}>
					<MoreHorizontal className="size-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-44">
				{actions.map((action) => (
					<DropdownMenuItem
						key={action}
						className={action === "terminate" ? "text-destructive focus:text-destructive" : undefined}
						onSelect={() => onAction(action)}
					>
						{LABELS[action]}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
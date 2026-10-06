"use client";

import { MoreHorizontal } from "lucide-react";
import { Can } from "@/components/shared/can";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/stores/auth.store";
import type { UserProfile } from "../types/users.types";

export type UserAction = "edit" | "add-account" | "notify" | "password" | "role" | "ban" | "unban" | "delete" | "impersonate";

interface UserActionsMenuProps {
	user: UserProfile;
	isSelf: boolean;
	onAction: (action: UserAction) => void;
}

export function UserActionsMenu({ user, isSelf, onAction }: UserActionsMenuProps) {
	const actorRole = useAuthStore((s) => s.user?.role);
	const banned = user.status === "banned";
	const locked = user.role === "superadmin" && actorRole !== "superadmin";

	return (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon" aria-label={`Actions for ${user.firstName} ${user.lastName}`}>
					<MoreHorizontal className="size-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-52">
				<DropdownMenuItem disabled={locked} onSelect={() => onAction("edit")}>
					Edit details
				</DropdownMenuItem>
				<DropdownMenuItem onSelect={() => onAction("add-account")}>Add account…</DropdownMenuItem>
				<DropdownMenuItem onSelect={() => onAction("notify")}>Send notification…</DropdownMenuItem>
				<DropdownMenuItem disabled={locked} onSelect={() => onAction("password")}>
					Set password
				</DropdownMenuItem>
				<Can permission="users:change-role">
					<DropdownMenuItem disabled={isSelf} onSelect={() => onAction("role")}>
						Change role
					</DropdownMenuItem>
				</Can>
				<Can permission="users:impersonate">
					<DropdownMenuItem disabled={isSelf || banned} onSelect={() => onAction("impersonate")}>
						View as this user
					</DropdownMenuItem>
				</Can>
				<DropdownMenuSeparator />
				{banned ? (
					<DropdownMenuItem disabled={locked} onSelect={() => onAction("unban")}>
						Unban
					</DropdownMenuItem>
				) : (
					<DropdownMenuItem disabled={isSelf || locked} onSelect={() => onAction("ban")}>
						Ban user
					</DropdownMenuItem>
				)}
				<DropdownMenuItem disabled={isSelf || locked} className="text-destructive focus:text-destructive" onSelect={() => onAction("delete")}>
					Delete…
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
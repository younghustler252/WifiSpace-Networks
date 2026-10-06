"use client";

import { useState } from "react";
import { toast } from "sonner";
import { AdminCreateAccountDialog } from "@/features/accounts/components/admin-create-account-dialog";
import { ComposeNotificationDialog } from "@/features/notifications/components/compose-notification-dialog";
import { useAdminUserActions, useImpersonation } from "../hooks/use-users";
import type { UserProfile } from "../types/users.types";
import type { UserAction } from "./user-actions-menu";
import { BanUserDialog, DeleteUserDialog, PasswordDialog, RoleDialog } from "./user-dialogs";
import { UserFormDialog } from "./user-form-dialog";

type DialogAction = Exclude<UserAction, "unban" | "impersonate">;

export function useUserActionHost() {
	const actions = useAdminUserActions();
	const impersonation = useImpersonation();
	const [dialog, setDialog] = useState<{ type: DialogAction; user: UserProfile } | null>(null);
	const close = () => setDialog(null);

	async function handle(action: UserAction, user: UserProfile) {
		if (action === "unban") {
			const res = await actions.unban.mutateAsync(user.id);
			if (res.success) toast.success("User unbanned");
			else toast.error(res.message);
			return;
		}

		if (action === "impersonate") {
			const res = await impersonation.start(user.id);
			if (!res.success) toast.error(res.message);
			return;
		}

		setDialog({ type: action, user });
	}

	const element = dialog && (
		<>
			{dialog.type === "edit" && <UserFormDialog user={dialog.user} onClose={close} />}
			{dialog.type === "ban" && <BanUserDialog user={dialog.user} onClose={close} />}
			{dialog.type === "role" && <RoleDialog user={dialog.user} onClose={close} />}
			{dialog.type === "password" && <PasswordDialog user={dialog.user} onClose={close} />}
			{dialog.type === "delete" && <DeleteUserDialog user={dialog.user} onClose={close} />}
			{dialog.type === "add-account" && <AdminCreateAccountDialog user={dialog.user} onClose={close} />}
			{dialog.type === "notify" && <ComposeNotificationDialog preset={{ users: [dialog.user] }} onClose={close} />}
		</>
	);

	return { handle, element };
}
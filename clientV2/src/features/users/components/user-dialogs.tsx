"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Field } from "@/components/shared/field";
import { PasswordInput } from "@/components/shared/password-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Role } from "@/types/roles";
import { useAdminUserActions } from "../hooks/use-users";
import { ROLE_OPTIONS } from "../schemas/users.schemas";
import type { UserProfile } from "../types/users.types";

interface UserDialogProps {
	user: UserProfile;
	onClose: () => void;
}

const fullName = (user: UserProfile) => `${user.firstName} ${user.lastName}`;

export function BanUserDialog({ user, onClose }: UserDialogProps) {
	const { ban } = useAdminUserActions();
	const [reason, setReason] = useState("");

	return (
		<ConfirmDialog
			open
			onOpenChange={(open) => !open && onClose()}
			destructive
			title={`Ban ${fullName(user)}?`}
			description="They'll lose access immediately and can't sign in until you unban them."
			confirmLabel="Ban user"
			onConfirm={async () => {
				const res = await ban.mutateAsync({ id: user.id, reason: reason.trim() || undefined });
				if (!res.success) {
					toast.error(res.message);
					return false;
				}
				toast.success("User banned");
			}}
		>
			<Textarea
				value={reason}
				onChange={(e) => setReason(e.target.value)}
				placeholder="Reason (optional)"
				aria-label="Reason for ban"
			/>
		</ConfirmDialog>
	);
}

export function RoleDialog({ user, onClose }: UserDialogProps) {
	const { setRole } = useAdminUserActions();
	const [role, setRoleValue] = useState<Role>(user.role);

	return (
		<ConfirmDialog
			open
			onOpenChange={(open) => !open && onClose()}
			title={`Change role for ${fullName(user)}`}
			description="A new role changes what they can see and do straight away."
			confirmLabel="Change role"
			confirmDisabled={role === user.role}
			onConfirm={async () => {
				const res = await setRole.mutateAsync({ id: user.id, role });
				if (!res.success) {
					toast.error(res.message);
					return false;
				}
				toast.success("Role updated");
			}}
		>
			<Select value={role} onValueChange={(value) => setRoleValue(value as Role)}>
				<SelectTrigger className="w-full" aria-label="Role">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					{ROLE_OPTIONS.map((option) => (
						<SelectItem key={option.value} value={option.value}>
							{option.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</ConfirmDialog>
	);
}

export function PasswordDialog({ user, onClose }: UserDialogProps) {
	const { setPassword } = useAdminUserActions();
	const [value, setValue] = useState("");
	const [error, setError] = useState<string | null>(null);

	return (
		<ConfirmDialog
			open
			onOpenChange={(open) => !open && onClose()}
			title={`Set a new password for ${fullName(user)}`}
			description="Share it with them securely. They can change it from their profile."
			confirmLabel="Update password"
			onConfirm={async () => {
				if (value.length < 8) {
					setError("Use at least 8 characters");
					return false;
				}
				const res = await setPassword.mutateAsync({ id: user.id, newPassword: value });
				if (!res.success) {
					toast.error(res.message);
					return false;
				}
				toast.success("Password updated");
			}}
		>
			<Field label="New password" htmlFor="admin-new-password" error={error ?? undefined}>
				<PasswordInput
					id="admin-new-password"
					autoComplete="new-password"
					value={value}
					onChange={(e) => {
						setValue(e.target.value);
						setError(null);
					}}
				/>
			</Field>
		</ConfirmDialog>
	);
}

export function DeleteUserDialog({ user, onClose }: UserDialogProps) {
	const { remove } = useAdminUserActions();

	return (
		<ConfirmDialog
			open
			onOpenChange={(open) => !open && onClose()}
			destructive
			requireText={user.email}
			title={`Delete ${fullName(user)}?`}
			description="This permanently removes the user and can't be undone. If you only want to block access, ban them instead."
			confirmLabel="Delete permanently"
			onConfirm={async () => {
				const res = await remove.mutateAsync(user.id);
				if (!res.success) {
					toast.error(res.message);
					return false;
				}
				toast.success("User deleted");
			}}
		/>
	);
}
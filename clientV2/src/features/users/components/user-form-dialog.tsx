"use client";

import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Field } from "@/components/shared/field";
import { PasswordInput } from "@/components/shared/password-input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { can } from "@/lib/rbac";
import { useAuthStore } from "@/stores/auth.store";
import { useAdminUserActions } from "../hooks/use-users";
import {
	CreateUserValues,
	EditUserValues,
	ROLE_OPTIONS,
	createUserSchema,
	editUserSchema,
} from "../schemas/users.schemas";
import type { AdminUpdateUserBody, UserProfile } from "../types/users.types";
import { USER_ERROR_CODES } from "../constants";

function CreateUserForm({ onDone }: { onDone: () => void }) {
	const router = useRouter();
	const { create } = useAdminUserActions();
	const actorRole = useAuthStore((s) => s.user?.role);
	const canSetRole = can(actorRole, "users:change-role");

	const {
		register,
		control,
		handleSubmit,
		setError,
		formState: { errors, isSubmitting },
	} = useForm<CreateUserValues>({
		resolver: zodResolver(createUserSchema),
		defaultValues: { firstName: "", lastName: "", email: "", phone: "", password: "", role: "customer" },
	});

	async function onSubmit(values: CreateUserValues) {
		const res = await create.mutateAsync({
			firstName: values.firstName,
			lastName: values.lastName,
			email: values.email,
			password: values.password,
			phone: values.phone || undefined,
			role: canSetRole ? values.role : undefined,
		});

		if (!res.success) {
			if (res.code === USER_ERROR_CODES.EMAIL_ALREADY_IN_USE) {
				setError("email", { message: "A user with this email already exists" });
				return;
			}
			toast.error(res.message);
			return;
		}

		toast.success("User created", {
			action: { label: "Open profile", onClick: () => router.push(`/admin/users/${res.data.id}`) },
		});
		onDone();
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
			<div className="grid gap-4 sm:grid-cols-2">
				<Field label="First name" htmlFor="new-first-name" error={errors.firstName?.message}>
					<Input id="new-first-name" autoComplete="off" aria-invalid={!!errors.firstName} {...register("firstName")} />
				</Field>
				<Field label="Last name" htmlFor="new-last-name" error={errors.lastName?.message}>
					<Input id="new-last-name" autoComplete="off" aria-invalid={!!errors.lastName} {...register("lastName")} />
				</Field>
			</div>
			<Field label="Email" htmlFor="new-email" error={errors.email?.message}>
				<Input id="new-email" type="email" inputMode="email" autoComplete="off" aria-invalid={!!errors.email} {...register("email")} />
			</Field>
			<div className="grid gap-4 sm:grid-cols-2">
				<Field label="Phone (optional)" htmlFor="new-phone" error={errors.phone?.message}>
					<Input id="new-phone" type="tel" inputMode="tel" autoComplete="off" aria-invalid={!!errors.phone} {...register("phone")} />
				</Field>
				{canSetRole && (
					<Field label="Role" htmlFor="new-role">
						<Controller
							control={control}
							name="role"
							render={({ field }) => (
								<Select value={field.value} onValueChange={field.onChange}>
									<SelectTrigger id="new-role" className="w-full">
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
							)}
						/>
					</Field>
				)}
			</div>
			<Field label="Temporary password" htmlFor="new-password" error={errors.password?.message} hint="At least 8 characters. Share it securely.">
				<PasswordInput id="new-password" autoComplete="new-password" aria-invalid={!!errors.password} {...register("password")} />
			</Field>
			<Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
				{isSubmitting && <Loader2 className="animate-spin" />}
				Create user
			</Button>
		</form>
	);
}

function EditUserForm({ user, onDone }: { user: UserProfile; onDone: () => void }) {
	const { update } = useAdminUserActions();

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting, dirtyFields },
	} = useForm<EditUserValues>({
		resolver: zodResolver(editUserSchema),
		defaultValues: {
			firstName: user.firstName ?? "",
			lastName: user.lastName ?? "",
			phone: user.phone ?? "",
			address: user.address ?? "",
		},
	});

	async function onSubmit(values: EditUserValues) {
		const body: AdminUpdateUserBody = {};
		if (dirtyFields.firstName) body.firstName = values.firstName.trim();
		if (dirtyFields.lastName) body.lastName = values.lastName.trim();
		if (dirtyFields.phone && values.phone) body.phone = values.phone.trim();
		if (dirtyFields.address && values.address) body.address = values.address.trim();

		if (Object.keys(body).length === 0) {
			onDone();
			return;
		}

		const res = await update.mutateAsync({ id: user.id, body });
		if (!res.success) {
			toast.error(res.message);
			return;
		}

		toast.success("User updated");
		onDone();
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
			<div className="grid gap-4 sm:grid-cols-2">
				<Field label="First name" htmlFor="edit-first-name" error={errors.firstName?.message}>
					<Input id="edit-first-name" aria-invalid={!!errors.firstName} {...register("firstName")} />
				</Field>
				<Field label="Last name" htmlFor="edit-last-name" error={errors.lastName?.message}>
					<Input id="edit-last-name" aria-invalid={!!errors.lastName} {...register("lastName")} />
				</Field>
			</div>
			<Field label="Phone" htmlFor="edit-phone" error={errors.phone?.message}>
				<Input id="edit-phone" type="tel" inputMode="tel" aria-invalid={!!errors.phone} {...register("phone")} />
			</Field>
			<Field label="Address" htmlFor="edit-address" error={errors.address?.message}>
				<Input id="edit-address" aria-invalid={!!errors.address} {...register("address")} />
			</Field>
			<Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
				{isSubmitting && <Loader2 className="animate-spin" />}
				Save changes
			</Button>
		</form>
	);
}

interface UserFormDialogProps {
	user?: UserProfile;
	onClose: () => void;
}

export function UserFormDialog({ user, onClose }: UserFormDialogProps) {
	return (
		<Dialog open onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="max-h-[90svh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>{user ? "Edit user" : "Add a user"}</DialogTitle>
					<DialogDescription>
						{user ? `Update details for ${user.email}.` : "Create an account directly. They can sign in straight away."}
					</DialogDescription>
				</DialogHeader>
				{user ? <EditUserForm user={user} onDone={onClose} /> : <CreateUserForm onDone={onClose} />}
			</DialogContent>
		</Dialog>
	);
}
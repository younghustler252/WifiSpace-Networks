"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Field } from "@/components/shared/field";
import { PasswordInput } from "@/components/shared/password-input";
import { Button } from "@/components/ui/button";
import { useChangePassword } from "../hooks/use-users";
import { ChangePasswordValues, changePasswordSchema } from "../schemas/users.schemas";
import { USER_ERROR_CODES } from "../constants";

export function PasswordForm() {
	const changePassword = useChangePassword();

	const {
		register,
		handleSubmit,
		reset,
		setError,
		formState: { errors, isSubmitting },
	} = useForm<ChangePasswordValues>({
		resolver: zodResolver(changePasswordSchema),
		defaultValues: { oldPassword: "", newPassword: "", confirmPassword: "" },
	});

	async function onSubmit(values: ChangePasswordValues) {
		const res = await changePassword.mutateAsync({
			oldPassword: values.oldPassword,
			newPassword: values.newPassword,
		});

		if (!res.success) {
			if (res.code === USER_ERROR_CODES.INVALID_OLD_PASSWORD) {
				setError("oldPassword", { message: "Your current password is incorrect" });
				return;
			}
			if (res.code === USER_ERROR_CODES.WEAK_PASSWORD || res.code === USER_ERROR_CODES.PASSWORD_SAME_AS_OLD) {
				setError("newPassword", { message: res.message });
				return;
			}
			toast.error(res.message);
			return;
		}

		toast.success("Password updated");
		reset();
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
			<Field label="Current password" htmlFor="oldPassword" error={errors.oldPassword?.message}>
				<PasswordInput id="oldPassword" autoComplete="current-password" aria-invalid={!!errors.oldPassword} {...register("oldPassword")} />
			</Field>
			<div className="grid gap-5 sm:grid-cols-2">
				<Field label="New password" htmlFor="newPassword" error={errors.newPassword?.message} hint="At least 8 characters">
					<PasswordInput id="newPassword" autoComplete="new-password" aria-invalid={!!errors.newPassword} {...register("newPassword")} />
				</Field>
				<Field label="Confirm new password" htmlFor="confirmPassword" error={errors.confirmPassword?.message}>
					<PasswordInput id="confirmPassword" autoComplete="new-password" aria-invalid={!!errors.confirmPassword} {...register("confirmPassword")} />
				</Field>
			</div>
			<Button type="submit" size="lg" className="w-full sm:w-auto" disabled={isSubmitting}>
				{isSubmitting && <Loader2 className="animate-spin" />}
				Update password
			</Button>
		</form>
	);
}
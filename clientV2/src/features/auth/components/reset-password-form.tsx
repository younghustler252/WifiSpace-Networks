"use client";

import { Controller, useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Field } from "@/components/shared/field";
import { PasswordInput } from "@/components/shared/password-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp";
import { ResetPasswordValues, resetPasswordSchema } from "../schemas/auth.schemas";
import { authApi } from "../services/auth.api";

export function ResetPasswordForm() {
	const router = useRouter();
	const params = useSearchParams();

	const {
		register,
		control,
		handleSubmit,
		setError,
		formState: { errors, isSubmitting },
	} = useForm<ResetPasswordValues>({
		resolver: zodResolver(resetPasswordSchema),
		defaultValues: { email: params.get("email") ?? "", otp: "", newPassword: "", confirmPassword: "" },
	});

	async function onSubmit(values: ResetPasswordValues) {
		const res = await authApi.resetPassword({
			email: values.email,
			otp: values.otp,
			newPassword: values.newPassword,
		});

		if (!res.success) {
			if (res.code === "VALIDATION_ERROR") {
				setError("otp", { message: res.message });
				return;
			}
			toast.error(res.message);
			return;
		}

		toast.success("Password updated. Sign in with your new password.");
		router.replace("/login");
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
			<Field label="Email" htmlFor="email" error={errors.email?.message}>
				<Input id="email" type="email" inputMode="email" autoComplete="email" aria-invalid={!!errors.email} {...register("email")} />
			</Field>

			<Field label="Reset code" htmlFor="otp" error={errors.otp?.message}>
				<Controller
					control={control}
					name="otp"
					render={({ field }) => (
						<InputOTP id="otp" maxLength={6} pattern={REGEXP_ONLY_DIGITS} value={field.value} onChange={field.onChange}>
							<InputOTPGroup>
								{[0, 1, 2].map((i) => (
									<InputOTPSlot key={i} index={i} className="size-11" aria-invalid={!!errors.otp} />
								))}
							</InputOTPGroup>
							<InputOTPSeparator />
							<InputOTPGroup>
								{[3, 4, 5].map((i) => (
									<InputOTPSlot key={i} index={i} className="size-11" aria-invalid={!!errors.otp} />
								))}
							</InputOTPGroup>
						</InputOTP>
					)}
				/>
			</Field>

			<Field label="New password" htmlFor="newPassword" error={errors.newPassword?.message} hint="At least 8 characters">
				<PasswordInput id="newPassword" autoComplete="new-password" aria-invalid={!!errors.newPassword} {...register("newPassword")} />
			</Field>

			<Field label="Confirm new password" htmlFor="confirmPassword" error={errors.confirmPassword?.message}>
				<PasswordInput id="confirmPassword" autoComplete="new-password" aria-invalid={!!errors.confirmPassword} {...register("confirmPassword")} />
			</Field>

			<Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
				{isSubmitting && <Loader2 className="animate-spin" />}
				Update password
			</Button>
		</form>
	);
}
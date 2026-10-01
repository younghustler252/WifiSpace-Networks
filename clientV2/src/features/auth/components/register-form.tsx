"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Field } from "@/components/shared/field";
import { PasswordInput } from "@/components/shared/password-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ERROR_CODES } from "@/types/error-codes";
import { RegisterValues, registerSchema } from "../schemas/auth.schemas";
import { authApi } from "../services/auth.api";

export function RegisterForm() {
	const router = useRouter();

	const {
		register,
		handleSubmit,
		setError,
		formState: { errors, isSubmitting },
	} = useForm<RegisterValues>({
		resolver: zodResolver(registerSchema),
		defaultValues: { firstName: "", lastName: "", email: "", phone: "", password: "", confirmPassword: "" },
	});

	async function onSubmit(values: RegisterValues) {
		const res = await authApi.register({
			firstName: values.firstName,
			lastName: values.lastName,
			email: values.email,
			password: values.password,
			phone: values.phone || undefined,
		});

		if (!res.success) {
			if (res.code === ERROR_CODES.CONFLICT || res.code === ERROR_CODES.EMAIL_ALREADY_IN_USE) {
				setError("email", { message: "An account with this email already exists" });
				return;
			}
			toast.error(res.message);
			return;
		}

		if (res.data.mailError) {
			toast.warning("We couldn't send your code. Tap resend on the next screen.");
		}
		const sent = res.data.mailError ? "" : "&sent=1";
		router.push(`/verify-email?email=${encodeURIComponent(values.email)}${sent}`);
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
			<div className="grid gap-5 sm:grid-cols-2">
				<Field label="First name" htmlFor="firstName" error={errors.firstName?.message}>
					<Input id="firstName" autoComplete="given-name" aria-invalid={!!errors.firstName} {...register("firstName")} />
				</Field>
				<Field label="Last name" htmlFor="lastName" error={errors.lastName?.message}>
					<Input id="lastName" autoComplete="family-name" aria-invalid={!!errors.lastName} {...register("lastName")} />
				</Field>
			</div>

			<Field label="Email" htmlFor="email" error={errors.email?.message}>
				<Input
					id="email"
					type="email"
					inputMode="email"
					autoComplete="email"
					placeholder="you@example.com"
					aria-invalid={!!errors.email}
					{...register("email")}
				/>
			</Field>

			<Field label="Phone (optional)" htmlFor="phone" error={errors.phone?.message}>
				<Input
					id="phone"
					type="tel"
					inputMode="tel"
					autoComplete="tel"
					placeholder="080 1234 5678"
					aria-invalid={!!errors.phone}
					{...register("phone")}
				/>
			</Field>

			<Field label="Password" htmlFor="password" error={errors.password?.message} hint="At least 8 characters">
				<PasswordInput id="password" autoComplete="new-password" aria-invalid={!!errors.password} {...register("password")} />
			</Field>

			<Field label="Confirm password" htmlFor="confirmPassword" error={errors.confirmPassword?.message}>
				<PasswordInput
					id="confirmPassword"
					autoComplete="new-password"
					aria-invalid={!!errors.confirmPassword}
					{...register("confirmPassword")}
				/>
			</Field>

			<Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
				{isSubmitting && <Loader2 className="animate-spin" />}
				Create account
			</Button>
		</form>
	);
}

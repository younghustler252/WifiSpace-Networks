"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Field } from "@/components/shared/field";
import { PasswordInput } from "@/components/shared/password-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AUTH_ERROR_CODES } from "../constants";
import { useCompleteAuth } from "../hooks/use-auth";
import { LoginValues, loginSchema } from "../schemas/auth.schemas";
import { authApi } from "../services/auth.api";

export function LoginForm() {
	const router = useRouter();
	const completeAuth = useCompleteAuth();

	const {
		register,
		handleSubmit,
		setError,
		formState: { errors, isSubmitting },
	} = useForm<LoginValues>({
		resolver: zodResolver(loginSchema),
		defaultValues: { email: "", password: "" },
	});

	async function onSubmit(values: LoginValues) {
		const res = await authApi.login(values);

		if (!res.success) {
			if (res.code === AUTH_ERROR_CODES.ACCOUNT_NOT_VERIFIED) {
				router.push(`/verify-email?email=${encodeURIComponent(values.email)}`);
				return;
			}
			if (res.code === AUTH_ERROR_CODES.INVALID_CREDENTIALS) {
				setError("password", { message: "Incorrect email or password" });
				return;
			}
			toast.error(res.message);
			return;
		}

		completeAuth(res.data);
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
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

			<Field label="Password" htmlFor="password" error={errors.password?.message}>
				<PasswordInput
					id="password"
					autoComplete="current-password"
					placeholder="Your password"
					aria-invalid={!!errors.password}
					{...register("password")}
				/>
			</Field>

			<div className="-mt-2 flex justify-end">
				<Link href="/forgot-password" className="text-sm text-muted-foreground hover:text-foreground">
					Forgot password?
				</Link>
			</div>

			<Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
				{isSubmitting && <Loader2 className="animate-spin" />}
				Sign in
			</Button>
		</form>
	);
}

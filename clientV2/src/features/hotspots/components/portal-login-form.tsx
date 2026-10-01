"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Field } from "@/components/shared/field";
import { PasswordInput } from "@/components/shared/password-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoginValues, loginSchema } from "@/features/auth/schemas/auth.schemas";
import { hotspotsApi } from "../services/hotspots.api";
import type { HotspotClientInfo } from "../types/hotspots.types";

interface PortalLoginFormProps {
	client: HotspotClientInfo;
	defaultEmail?: string;
	onBack: () => void;
}

export function PortalLoginForm({ client, defaultEmail, onBack }: PortalLoginFormProps) {
	const queryClient = useQueryClient();

	const {
		register,
		handleSubmit,
		setError,
		formState: { errors, isSubmitting },
	} = useForm<LoginValues>({
		resolver: zodResolver(loginSchema),
		defaultValues: { email: defaultEmail ?? "", password: "" },
	});

	async function onSubmit(values: LoginValues) {
		const res = await hotspotsApi.login({ ...client, ...values });

		if (!res.success) {
			if (res.code === "INVALID_CREDENTIALS") {
				setError("password", { message: "Incorrect email or password" });
				return;
			}
			toast.error(res.message);
			return;
		}

		await queryClient.invalidateQueries({ queryKey: ["hotspot", "session"] });
		onBack();
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					{defaultEmail
						? `We found an account for ${defaultEmail}. Sign in to continue on this device.`
						: "Sign in to use your account on this device."}
				</p>
			</div>

			<form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
				<Field label="Email" htmlFor="portal-login-email" error={errors.email?.message}>
					<Input
						id="portal-login-email"
						type="email"
						inputMode="email"
						autoComplete="email"
						aria-invalid={!!errors.email}
						{...register("email")}
					/>
				</Field>
				<Field label="Password" htmlFor="portal-login-password" error={errors.password?.message}>
					<PasswordInput
						id="portal-login-password"
						autoComplete="current-password"
						aria-invalid={!!errors.password}
						{...register("password")}
					/>
				</Field>
				<Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
					{isSubmitting && <Loader2 className="animate-spin" />}
					Sign in
				</Button>
			</form>

			<button type="button" onClick={onBack} className="w-full text-center text-[13px] text-muted-foreground hover:text-foreground">
				Back to plans
			</button>
		</div>
	);
}
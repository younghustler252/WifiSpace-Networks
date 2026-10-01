"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Field } from "@/components/shared/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ForgotPasswordValues, forgotPasswordSchema } from "../schemas/auth.schemas";
import { authApi } from "../services/auth.api";

export function ForgotPasswordForm() {
	const router = useRouter();

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<ForgotPasswordValues>({
		resolver: zodResolver(forgotPasswordSchema),
		defaultValues: { email: "" },
	});

	async function onSubmit(values: ForgotPasswordValues) {
		const res = await authApi.forgotPassword(values);
		if (!res.success) {
			toast.error(res.message);
			return;
		}
		router.push(`/reset-password?email=${encodeURIComponent(values.email)}`);
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
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
			<Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
				{isSubmitting && <Loader2 className="animate-spin" />}
				Send reset code
			</Button>
		</form>
	);
}
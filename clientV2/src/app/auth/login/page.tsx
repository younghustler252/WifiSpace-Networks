"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { InputField } from "@/components/ui/InputField";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";
import { ArrowRight, Lock, Eye, EyeOff, Mail } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { AuthFooter } from "@/components/ui/AuthFooter";

interface LoginFormInputs {
	email: string;
	password: string;
}

export default function Login() {
	const { login } = useAuth();
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [successMessage, setSuccessMessage] = useState("");
	const [showPassword, setShowPassword] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<LoginFormInputs>();

	const onSubmit = async (data: LoginFormInputs) => {
		setLoading(true);
		setError("");
		setSuccessMessage("");

		try {
			const response = await login(data);
			console.log("Login response:", response);

			

			const isVerified = response?.user?.isVerified === true;

			if (!isVerified) {
				router.push("/auth/verify");
			} else {
				router.push("/");
			}
		} catch (err: any) {
			setError(err?.message || "Login failed");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="w-full max-w-md ui-stack-lg">
			<h1 className="text-2xl font-bold text-center">Login</h1>

			{successMessage && (
	<StatusBadge
		variant="successful"
		size="md"
		className="mb-4 w-full text-center"
	>
		{successMessage}
	</StatusBadge>
)}

{error && (
	<StatusBadge
		variant="failed"
		size="md"
		className="mb-4 w-full text-center"
	>
		{error}
	</StatusBadge>
)}


			<form onSubmit={handleSubmit(onSubmit)} className="ui-stack">
				<InputField
					label="Email"
					type="email"
					placeholder="Enter your email"
					leftIcon={<Mail size={18} />}
					{...register("email", { required: "Email is required" })}
				/>
				{errors.email && (
					<p className="text-red-500 text-sm">{errors.email.message}</p>
				)}

				<InputField
					label="Password"
					type={showPassword ? "text" : "password"}
					placeholder="******"
					leftIcon={<Lock size={18} />}
					rightIcon={
						<button
							type="button"
							onClick={() => setShowPassword(!showPassword)}
							className="text-muted-foreground"
						>
							{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
						</button>
					}
					{...register("password", { required: "Password is required" })}
				/>
				{errors.password && (
					<p className="text-red-500 text-sm">{errors.password.message}</p>
				)}

				<Button
					type="submit"
					fullWidth
					rightIcon={!loading && <ArrowRight size={18} />}
					variant="accent"
					isLoading={loading}
				>
					Login
				</Button>
			</form>

			<AuthFooter
				text="Don't have an account?"
				linkText="Register"
				linkHref="/auth/register"
			/>
		</div>
	);
}
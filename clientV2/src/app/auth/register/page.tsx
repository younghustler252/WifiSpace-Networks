"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { InputField } from "@/components/ui/InputField";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";
import { ArrowRight, Lock, Eye, EyeOff, Mail, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { AuthFooter } from "@/components/ui/AuthFooter";

interface RegisterFormInputs {
	firstName: string;
	lastName: string;
	email: string;
	password: string;
}

export default function Register() {
	const { register: registerUser } = useAuth();
	const router = useRouter();

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [successMessage, setSuccessMessage] = useState("");
	const [showPassword, setShowPassword] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<RegisterFormInputs>();

	const onSubmit = async (data: RegisterFormInputs) => {
		setLoading(true);
		setError("");
		setSuccessMessage("");

		try {
			const response = await registerUser({
				...data,
				firstName: data.firstName.trim(),
				lastName: data.lastName.trim(),
				email: data.email.toLowerCase().trim(),
			});

			// if (response?.message) {
			// 	setSuccessMessage(response.message);
			// }

			// Redirect to verification page
			router.push("/auth/verify");
		} catch (err: any) {
			setError(err?.message || "Registration failed");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="w-full max-w-md ui-stack-lg">
			<h1 className="text-2xl font-bold text-center">Register</h1>

			{successMessage && (
				<StatusBadge
					variant="success"
					size="md"
					className="mb-4 w-full text-center"
				>
					{successMessage}
				</StatusBadge>
			)}

			{error && (
				<StatusBadge
					variant="danger"
					size="md"
					className="mb-4 w-full text-center"
				>
					{error}
				</StatusBadge>
			)}

			<form onSubmit={handleSubmit(onSubmit)} className="ui-stack">
				<InputField
					label="First Name"
					placeholder="John"
					leftIcon={<User size={18} />}
					{...register("firstName", {
						required: "First name is required",
						minLength: {
							value: 2,
							message: "Must be at least 2 characters",
						},
					})}
					errorMessage={errors.firstName?.message}
				/>

				<InputField
					label="Last Name"
					placeholder="Doe"
					leftIcon={<User size={18} />}
					{...register("lastName", {
						required: "Last name is required",
						minLength: {
							value: 2,
							message: "Must be at least 2 characters",
						},
					})}
					errorMessage={errors.lastName?.message}
				/>

				<InputField
					label="Email"
					type="email"
					placeholder="Enter your email"
					leftIcon={<Mail size={18} />}
					{...register("email", {
						required: "Email is required",
						pattern: {
							value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
							message: "Enter a valid email address",
						},
					})}
					errorMessage={errors.email?.message}
				/>

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
					{...register("password", {
						required: "Password is required",
						minLength: {
							value: 6,
							message: "Password must be at least 6 characters",
						},
						validate: (value) =>
							/[A-Z]/.test(value) ||
							"Password must contain at least one uppercase letter",
					})}
					errorMessage={errors.password?.message}
				/>

				<Button
					type="submit"
					fullWidth
					rightIcon={!loading && <ArrowRight size={18} />}
					variant="accent"
					isLoading={loading}
				>
					Register
				</Button>
			</form>

			<AuthFooter
				text="Already have an account?"
				linkText="Login"
				linkHref="/auth/login"
			/>
		</div>
	);
}
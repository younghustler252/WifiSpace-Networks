"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { InputField } from "@/components/ui/InputField";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";
import { ArrowRight, Mail } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { AuthFooter } from "@/components/ui/AuthFooter";

interface VerifyOtpFormInputs {
	otp: string;
}

export default function VerifyOtp() {
	const { user, accessToken, verifyOtp, resendOtp } = useAuth();
	const router = useRouter();

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [successMessage, setSuccessMessage] = useState("");
	const [timer, setTimer] = useState(60);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<VerifyOtpFormInputs>();

	// Auto-send OTP on mount if user exists
	useEffect(() => {
		if (user && !user.isVerified) {
			resendOtp(user.email);
		}
	}, [user, resendOtp]);

	// Countdown timer for OTP resend
	useEffect(() => {
		if (timer === 0) return;

		const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
		return () => clearInterval(interval);
	}, [timer]);

	// Handle OTP submission
	const onSubmit = async (data: VerifyOtpFormInputs) => {
		setLoading(true);
		setError("");
		setSuccessMessage("");

		try {
			if (!user) throw new Error("User not found");

			const response = await verifyOtp({
				email: user.email,
				otp: data.otp,
			});

			setSuccessMessage("OTP verified successfully");
			// Redirect to dashboard after success
			router.push("/dashboard");
		} catch (err: any) {
			setError(err?.message || "OTP verification failed");
		} finally {
			setLoading(false);
		}
	};

	// Resend OTP
	const handleResendOtp = async () => {
		setError("");
		setSuccessMessage("");

		try {
			if (!user) throw new Error("User not found");

			await resendOtp(user.email);
			setTimer(60);
			setSuccessMessage("OTP has been resent to your email.");
		} catch (err: any) {
			setError("Failed to resend OTP. Please try again.");
		}
	};

	return (
		<div className="w-full max-w-md ui-stack-lg mx-auto mt-16">
			<h1 className="text-2xl font-bold text-center">Verify Your Email</h1>

			<p className="text-center text-sm text-muted-foreground mb-4">
				We sent an OTP to your email. Enter it below to verify your account.
			</p>

			{successMessage && (
				<StatusBadge
					variant="success"
					solid
					size="md"
					className="mb-4 w-full text-center"
				>
					{successMessage}
				</StatusBadge>
			)}

			{error && (
				<StatusBadge
					variant="danger"
					solid
					size="md"
					className="mb-4 w-full text-center"
				>
					{error}
				</StatusBadge>
			)}

			<form onSubmit={handleSubmit(onSubmit)} className="ui-stack">
				<InputField
					label="OTP"
					placeholder="Enter the 6-digit OTP"
					leftIcon={<Mail size={18} />}
					{...register("otp", {
						required: "OTP is required",
						minLength: { value: 6, message: "OTP must be 6 digits" },
						maxLength: { value: 6, message: "OTP must be 6 digits" },
					})}
					errorMessage={errors.otp?.message}
				/>

				<Button
					type="submit"
					fullWidth
					rightIcon={!loading && <ArrowRight size={18} />}
					variant="accent"
					isLoading={loading}
				>
					Verify OTP
				</Button>
			</form>

			<div className="text-center mt-4 text-sm text-muted-foreground">
				{timer > 0 ? (
					<p>You can resend OTP in {timer} seconds</p>
				) : (
					<button
						onClick={handleResendOtp}
						className="text-blue-500 hover:underline"
					>
						Resend OTP
					</button>
				)}
			</div>

			<AuthFooter
				text="Back to login?"
				linkText="Login"
				linkHref="/auth/login"
			/>
		</div>
	);
}
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
	const { user, verifyOtp, resendOtp } = useAuth();
	const router = useRouter();

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [successMessage, setSuccessMessage] = useState("");

	// derived from backend expiry
	const [timeLeft, setTimeLeft] = useState<number>(0);

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

	// derive countdown from otpExpiresAt (refresh-safe)
	useEffect(() => {
		if (!user?.otpExpiresAt) return;

		const updateTimer = () => {
			// otpExpiresAt may be undefined at type level; guard defensively
			const expiresAt = user.otpExpiresAt ?? 0;
			if (!expiresAt) {
				setTimeLeft(0);
				return;
			}

			const diff = Math.floor((expiresAt - Date.now()) / 1000);
			setTimeLeft(diff > 0 ? diff : 0);
		};

		updateTimer();

		const interval = setInterval(updateTimer, 1000);
		return () => clearInterval(interval);
	}, [user?.otpExpiresAt]);

	// Handle OTP submission
	const onSubmit = async (data: VerifyOtpFormInputs) => {
		setLoading(true);
		setError("");
		setSuccessMessage("");

		try {
			if (!user) throw new Error("User not found");

			await verifyOtp({
				email: user.email,
				otp: data.otp,
			});

			setSuccessMessage("OTP verified successfully");

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

			const res = await resendOtp(user.email);
			console.log("Resend OTP response:", res);

			// IMPORTANT:
			// expect backend to return new otpExpiresAt
			if (res?.otpExpiresAt) {
				user.otpExpiresAt = res.otpExpiresAt;
			}

			setSuccessMessage("OTP has been resent to your email.");
		} catch (err: any) {
			setError("Failed to resend OTP. Please try again.");
		}
	};

	const formatTime = (seconds: number) => {
		const m = Math.floor(seconds / 60);
		const s = seconds % 60;
		return `${m}:${s.toString().padStart(2, "0")}`;
	};

	return (
		<div className="w-full max-w-md ui-stack-lg mx-auto mt-16">
			<h1 className="text-2xl font-bold text-center">Verify Your Email</h1>

			<p className="text-center text-sm text-muted-foreground mb-2">
				We sent an OTP to your email. Enter it below to verify your account.
			</p>

			{/* expiry info */}
			{user?.otpExpiresAt && (
				<p className="text-center text-sm text-muted-foreground mb-4">
					OTP expires in:{" "}
					<span className={timeLeft === 0 ? "text-red-500" : ""}>
						{formatTime(timeLeft)}
					</span>
				</p>
			)}

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
					disabled={timeLeft === 0}
				>
					Verify OTP
				</Button>
			</form>

			<div className="text-center mt-4 text-sm text-muted-foreground">
				{timeLeft > 0 ? (
					<p>You can resend OTP after expiry</p>
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
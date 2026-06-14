"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

import { InputField } from "@/components/ui/InputField";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";
import { ArrowRight, Mail } from "lucide-react";
import { AuthFooter } from "@/components/ui/AuthFooter";

interface VerifyOtpFormInputs {
	otp: string;
}

type UiState =
	| "idle"
	| "sending"
	| "verifying"
	| "cooldown"
	| "error"
	| "success";

export default function VerifyOtp() {
	const { user, verifyOtp, resendOtp, pendingEmail } = useAuth();
	const router = useRouter();

	const [uiState, setUiState] = useState<UiState>("idle");
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	const [nextResendAt, setNextResendAt] = useState<number | null>(null);
	const [timeLeft, setTimeLeft] = useState<number>(0);

	const email = user?.email || pendingEmail;

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<VerifyOtpFormInputs>();

	// ----------------------------
	// RESEND TIMER (backend driven)
	// ----------------------------
	useEffect(() => {
		if (!nextResendAt) return;

		const tick = () => {
			const diff = Math.max(
				0,
				Math.floor((nextResendAt - Date.now()) / 1000)
			);

			setTimeLeft(diff);

			if (diff <= 0) {
				setUiState("idle");
			}
		};

		tick();
		const interval = setInterval(tick, 1000);

		return () => clearInterval(interval);
	}, [nextResendAt]);

	// ----------------------------
	// AUTO RESEND ON LOAD (optional UX)
	// ----------------------------
	useEffect(() => {
		if (!email) return;

		// optional: auto trigger first OTP
		handleResendOtp();
	}, [email]);

	// ----------------------------
	// VERIFY OTP
	// ----------------------------
	const onSubmit = async (data: VerifyOtpFormInputs) => {
		setUiState("verifying");
		setError("");
		setSuccess("");

		try {
			if (!email) throw new Error("No email found");

			await verifyOtp({
				email,
				otp: data.otp,
			});

			setUiState("success");
			setSuccess("Account verified successfully");

			setTimeout(() => {
				router.push("/dashboard");
			}, 800);
		} catch (err: any) {
			setUiState("error");
			setError(err.message || "Verification failed");
		}
	};

	// ----------------------------
	// RESEND OTP
	// ----------------------------
	const handleResendOtp = async () => {
		if (!email) return;

		setUiState("sending");
		setError("");
		setSuccess("");

		try {
			const res = await resendOtp(email);

			setSuccess(res.message);

			// backend is source of truth
			setNextResendAt(res.nextResendAt);

			setUiState("cooldown");
		} catch (err: any) {
			setUiState("error");
			setError(err.message || "Failed to resend OTP");
		}
	};

	const formatTime = (s: number) => {
		const m = Math.floor(s / 60);
		const r = s % 60;
		return `${m}:${r.toString().padStart(2, "0")}`;
	};

	// ----------------------------
	// GUARD
	// ----------------------------
	if (!email) {
		return (
			<div className="text-center mt-20 text-red-500">
				No verification session found
			</div>
		);
	}

	return (
		<div className="w-full max-w-md mx-auto mt-16 space-y-5">

			<h1 className="text-2xl font-bold text-center">
				Verify Your Email
			</h1>

			<p className="text-center text-sm text-muted-foreground">
				We sent an OTP to{" "}
				<span className="font-medium">{email}</span>
			</p>

			{/* TIMER */}
			{nextResendAt && timeLeft > 0 && (
				<p className="text-center text-sm text-muted-foreground">
					Resend available in{" "}
					<span className="text-blue-500">
						{formatTime(timeLeft)}
					</span>
				</p>
			)}

			{/* SUCCESS / ERROR */}
			{success && (
				<StatusBadge variant="success" solid>
					{success}
				</StatusBadge>
			)}

			{error && (
				<StatusBadge variant="danger" solid>
					{error}
				</StatusBadge>
			)}

			{/* OTP FORM */}
			<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
				<InputField
					label="OTP"
					placeholder="Enter 6-digit code"
					leftIcon={<Mail size={18} />}
					{...register("otp", {
						required: "OTP required",
						minLength: 6,
						maxLength: 6,
					})}
					errorMessage={errors.otp?.message}
				/>

				<Button
					type="submit"
					fullWidth
					rightIcon={<ArrowRight size={18} />}
					isLoading={uiState === "verifying"}
				>
					Verify OTP
				</Button>
			</form>

			{/* RESEND BUTTON */}
			<div className="text-center text-sm">
				{timeLeft > 0 ? (
					<p className="text-muted-foreground">
						You can resend after cooldown
					</p>
				) : (
					<button
						onClick={handleResendOtp}
						disabled={uiState === "sending"}
						className="text-blue-500 hover:underline"
					>
						{uiState === "sending"
							? "Sending..."
							: "Resend OTP"}
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
"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { useCountdown } from "@/hooks/use-countdown";
import { AUTH_ERROR_CODES } from "../constants";
import { useCompleteAuth } from "../hooks/use-auth";
import { authApi } from "../services/auth.api";

const COOLDOWN_MS = 60_000;

function maskEmail(email: string) {
	const [name, domain] = email.split("@");
	if (!name || !domain) return email;
	return `${name.slice(0, 2)}${"•".repeat(Math.max(1, name.length - 2))}@${domain}`;
}

export function VerifyEmailForm() {
	const params = useSearchParams();
	const email = params.get("email") ?? "";
	const justSent = params.get("sent") === "1";
	const completeAuth = useCompleteAuth();

	const [otp, setOtp] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [verifying, setVerifying] = useState(false);
	const [resending, setResending] = useState(false);
	const [nextResendAt, setNextResendAt] = useState<string | null>(() =>
		justSent ? new Date(Date.now() + COOLDOWN_MS).toISOString() : null
	);
	const secondsLeft = useCountdown(nextResendAt);

	async function verify(code: string) {
		if (verifying) return;
		setVerifying(true);
		setError(null);
		const res = await authApi.verifyOtp({ email, otp: code });
		setVerifying(false);

		if (!res.success) {
			setError(res.message);
			setOtp("");
			return;
		}
		completeAuth(res.data);
	}

	async function resend() {
		setResending(true);
		const res = await authApi.resendOtp({ email });
		setResending(false);

		if (!res.success) {
			if (res.code === AUTH_ERROR_CODES.RESEND_COOLDOWN_ACTIVE) {
				setNextResendAt(new Date(Date.now() + COOLDOWN_MS).toISOString());
			}
			toast.error(res.message);
			return;
		}

		setNextResendAt(res.data.nextResendAt);
		setOtp("");
		setError(null);
		toast.success("A new code is on its way");
	}

	if (!email) {
		return (
			<p className="text-sm text-muted-foreground">
				We couldn&apos;t find an email to verify.{" "}
				<Link href="/register" className="font-medium text-primary hover:underline">
					Start again
				</Link>
			</p>
		);
	}

	return (
		<div className="space-y-6">
			<p className="text-sm text-muted-foreground">
				Enter the 6-digit code we sent to <span className="font-medium text-foreground">{maskEmail(email)}</span>.
			</p>

			<div className="flex justify-center">
				<InputOTP
					maxLength={6}
					value={otp}
					onChange={(value) => {
						setOtp(value);
						setError(null);
					}}
					onComplete={verify}
					pattern={REGEXP_ONLY_DIGITS}
					disabled={verifying}
					autoFocus
				>
					<InputOTPGroup>
						{[0, 1, 2].map((i) => (
							<InputOTPSlot key={i} index={i} className="size-12 text-lg" aria-invalid={!!error} />
						))}
					</InputOTPGroup>
					<InputOTPSeparator />
					<InputOTPGroup>
						{[3, 4, 5].map((i) => (
							<InputOTPSlot key={i} index={i} className="size-12 text-lg" aria-invalid={!!error} />
						))}
					</InputOTPGroup>
				</InputOTP>
			</div>

			{error && (
				<p role="alert" className="text-center text-sm text-destructive">
					{error}
				</p>
			)}

			{verifying && (
				<p className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
					<Loader2 className="size-4 animate-spin" />
					Verifying…
				</p>
			)}

			<div className="card-elevated flex items-center gap-3 bg-surface-2 p-4 text-[13px]">
				<Mail className="size-5 shrink-0 text-signal" />
				<p>Didn&apos;t get it? Check your spam folder, or request a new code.</p>
			</div>

			<Button
				type="button"
				variant="outline"
				className="w-full bg-surface-2"
				onClick={resend}
				disabled={resending || secondsLeft > 0}
			>
				{resending && <Loader2 className="animate-spin" />}
				{secondsLeft > 0 ? `Resend code in ${secondsLeft}s` : "Resend code"}
			</Button>
		</div>
	);
}

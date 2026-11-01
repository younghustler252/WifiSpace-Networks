"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Field } from "@/components/shared/field";
import { PasswordInput } from "@/components/shared/password-input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { USER_ERROR_CODES } from "../constants";
import { useEmailChange } from "../hooks/use-users";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function secondsUntil(iso: string | null) {
	if (!iso) return 0;
	return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 1000));
}

export function ChangeEmailDialog({ currentEmail, onClose }: { currentEmail: string; onClose: () => void }) {
	const { request, confirm } = useEmailChange();
	const [step, setStep] = useState<"request" | "confirm">("request");
	const [newEmail, setNewEmail] = useState("");
	const [password, setPassword] = useState("");
	const [otp, setOtp] = useState("");
	const [pending, setPending] = useState("");
	const [resendAfter, setResendAfter] = useState<string | null>(null);
	const [wait, setWait] = useState(0);
	const [errors, setErrors] = useState<Partial<Record<"newEmail" | "password" | "otp", string>>>({});
	const busy = request.isPending || confirm.isPending;

	useEffect(() => {
		if (!resendAfter) return;
		setWait(secondsUntil(resendAfter));
		const timer = setInterval(() => setWait(secondsUntil(resendAfter)), 1000);
		return () => clearInterval(timer);
	}, [resendAfter]);

	function restart() {
		setStep("request");
		setOtp("");
		setErrors({});
	}

	async function sendCode() {
		const next: typeof errors = {};
		const email = newEmail.trim().toLowerCase();
		if (!EMAIL_PATTERN.test(email)) next.newEmail = "Enter a valid email address";
		else if (email === currentEmail.toLowerCase()) next.newEmail = "That's already your email";
		if (!password) next.password = "Enter your current password";
		if (Object.keys(next).length > 0) {
			setErrors(next);
			return;
		}

		const res = await request.mutateAsync({ newEmail: email, password });
		if (!res.success) {
			if (res.code === USER_ERROR_CODES.INVALID_OLD_PASSWORD) setErrors({ password: res.message });
			else if (res.code === USER_ERROR_CODES.EMAIL_ALREADY_IN_USE || res.code === USER_ERROR_CODES.EMAIL_UNCHANGED) setErrors({ newEmail: res.message });
			else toast.error(res.message);
			return;
		}

		setPending(res.data.pendingEmail);
		setResendAfter(res.data.resendAfter);
		setOtp("");
		setErrors({});
		setStep("confirm");
		toast.success("Code sent", { description: `Check ${res.data.pendingEmail}.` });
	}

	async function confirmCode() {
		if (!/^\d{6}$/.test(otp.trim())) {
			setErrors({ otp: "Enter the 6-digit code" });
			return;
		}

		const res = await confirm.mutateAsync({ otp: otp.trim() });
		if (!res.success) {
			const code = res.code;
			if (code === USER_ERROR_CODES.OTP_INVALID) {
				setErrors({ otp: res.message });
				return;
			}
			if (code === USER_ERROR_CODES.OTP_EXPIRED) {
				setErrors({ otp: res.message });
				return;
			}
			if (code === USER_ERROR_CODES.OTP_LOCKED || code === USER_ERROR_CODES.EMAIL_CHANGE_NOT_REQUESTED || code === USER_ERROR_CODES.EMAIL_ALREADY_IN_USE) {
				toast.error(res.message);
				restart();
				return;
			}
			toast.error(res.message);
			return;
		}

		toast.success("Email changed", { description: "Sign in with the new address from now on." });
		onClose();
	}

	return (
		<Dialog open onOpenChange={(open) => !open && !busy && onClose()}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Change your email</DialogTitle>
					<DialogDescription>
						{step === "request"
							? "We'll send a 6-digit code to the new address. Nothing changes until you enter it."
							: `Enter the code we sent to ${pending}. It's valid for 10 minutes.`}
					</DialogDescription>
				</DialogHeader>

				{step === "request" ? (
					<div className="space-y-5">
						<Field label="New email" htmlFor="new-email" error={errors.newEmail}>
							<Input id="new-email" type="email" inputMode="email" autoComplete="email" value={newEmail} aria-invalid={!!errors.newEmail} onChange={(e) => { setNewEmail(e.target.value); setErrors((p) => ({ ...p, newEmail: undefined })); }} />
						</Field>
						<Field label="Current password" htmlFor="new-email-password" error={errors.password}>
							<PasswordInput id="new-email-password" autoComplete="current-password" value={password} aria-invalid={!!errors.password} onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); }} />
						</Field>
						<Button size="lg" className="w-full" disabled={busy} onClick={sendCode}>
							{request.isPending && <Loader2 className="animate-spin" />}
							Send code
						</Button>
					</div>
				) : (
					<div className="space-y-5">
						<Field label="6-digit code" htmlFor="email-otp" error={errors.otp}>
							<Input
								id="email-otp"
								inputMode="numeric"
								autoComplete="one-time-code"
								maxLength={6}
								className="text-mono text-center text-lg tracking-[0.5em]"
								value={otp}
								aria-invalid={!!errors.otp}
								onChange={(e) => { setOtp(e.target.value.replace(/\D/g, "")); setErrors({}); }}
							/>
						</Field>
						<Button size="lg" className="w-full" disabled={busy} onClick={confirmCode}>
							{confirm.isPending && <Loader2 className="animate-spin" />}
							Confirm new email
						</Button>
						<div className="flex items-center justify-between gap-3">
							<Button variant="ghost" className="min-h-11" disabled={busy} onClick={restart}>
								Use a different email
							</Button>
							<Button variant="ghost" className="min-h-11" disabled={busy || wait > 0} onClick={sendCode}>
								{wait > 0 ? `Resend in ${wait}s` : "Resend code"}
							</Button>
						</div>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}

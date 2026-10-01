import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/features/auth/components/auth-form";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";

export const metadata: Metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
	return (
		<AuthForm
			title="Reset your password"
			subtitle="Enter your email and we'll send you a code to set a new password."
			footer={
				<Link href="/login" className="font-medium text-primary hover:underline">
					Back to sign in
				</Link>
			}
		>
			<ForgotPasswordForm />
		</AuthForm>
	);
}
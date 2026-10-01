import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/features/auth/components/auth-form";
import { VerifyEmailForm } from "@/features/auth/components/verify-email-form";

export const metadata: Metadata = { title: "Verify your email" };

export default function VerifyEmailPage() {
	return (
		<AuthForm
			title="Check your email"
			subtitle="We sent a 6-digit code to confirm your account."
			footer={
				<>
					Wrong email?{" "}
					<Link href="/register" className="font-medium text-primary hover:underline">
						Use a different one
					</Link>
				</>
			}
		>
			<Suspense>
				<VerifyEmailForm />
			</Suspense>
		</AuthForm>
	);
}
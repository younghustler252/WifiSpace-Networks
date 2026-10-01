import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/features/auth/components/auth-form";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";

export const metadata: Metadata = { title: "Set a new password" };

export default function ResetPasswordPage() {
	return (
		<AuthForm
			title="Set a new password"
			subtitle="Enter the code we emailed you and choose a new password."
			footer={
				<>
					No code?{" "}
					<Link href="/forgot-password" className="font-medium text-primary hover:underline">
						Request a new one
					</Link>
				</>
			}
		>
			<Suspense>
				<ResetPasswordForm />
			</Suspense>
		</AuthForm>
	);
}
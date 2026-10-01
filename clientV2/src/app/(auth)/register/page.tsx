import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/features/auth/components/auth-form";
import { RegisterForm } from "@/features/auth/components/register-form";

export const metadata: Metadata = { title: "Create account" };

export default function RegisterPage() {
	return (
		<AuthForm
			title="Create your account"
			subtitle="It takes a minute. We'll email you a code to confirm."
			footer={
				<>
					Already have an account?{" "}
					<Link href="/login" className="font-medium text-primary hover:underline">
						Sign in
					</Link>
				</>
			}
		>
			<RegisterForm />
		</AuthForm>
	);
}
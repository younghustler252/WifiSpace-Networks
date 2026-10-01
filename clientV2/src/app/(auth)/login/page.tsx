import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/features/auth/components/auth-form";
import { LoginForm } from "@/features/auth/components/login-form";
import { company } from "@/config/company";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
	return (
		<AuthForm
			title="Welcome back"
			subtitle="Sign in to manage your plan, usage and payments."
			footer={
				<>
					New to {company.name}?{" "}
					<Link href="/register" className="font-medium text-primary hover:underline">
						Create an account
					</Link>
				</>
			}
		>
			<Suspense>
				<LoginForm />
			</Suspense>
		</AuthForm>
	);
}
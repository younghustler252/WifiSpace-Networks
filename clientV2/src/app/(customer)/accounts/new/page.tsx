import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { RequestAccountForm } from "@/features/accounts/components/request-account-form";

export const metadata: Metadata = { title: "Add account" };

export default function NewAccountPage() {
	return (
		<div className="max-w-xl space-y-8">
			<PageHeader title="Add an account" description="Tell us what you need and we'll take it from there." />
			<RequestAccountForm />
		</div>
	);
}
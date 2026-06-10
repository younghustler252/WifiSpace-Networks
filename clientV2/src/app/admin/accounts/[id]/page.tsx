"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";

import PageHeader from "@/components/ui/PageHeader";
import AccountPanel from "@/features/account/AccountPanel";
import { accountApi } from "@/lib/api/account";

export default function Page() {
	const params = useParams();
	const router = useRouter();
	const id = params?.id as string;

	const { data: accountRes, isLoading, error } = useQuery({
		queryKey: ["account", id],
		queryFn: () => accountApi.getAccountById(id),
		enabled: !!id,
	});

	const account = accountRes?.data;

	if (isLoading) {
		return (
			<div className="p-6 text-center text-muted-foreground">Loading account...</div>
		);
	}

	if (error) {
		return (
			<div className="p-6 text-center text-danger">Failed to load account</div>
		);
	}

	return (
		<>
			<PageHeader
				title="Account Details"
				subtitle="Manage customer account, subscriptions, payments and network"
				actions={
					<button
						onClick={() => router.back()}
						className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted transition"
					>
						← Back
					</button>
				}
			/>

			<div className="p-6">
				<AccountPanel account={account} role="superAdmin" />
			</div>
		</>
	);
}
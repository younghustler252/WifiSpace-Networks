"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";

import AccountDetailsView from "@/components/pages/AccountDetailsView";
import PageHeader from "@/components/ui/PageHeader";
import { accountApi } from "@/lib/api/account";

export default function Page() {
	const params = useParams();
	const router = useRouter();

	const id = params?.id as string;

	// ================= ACCOUNT QUERY =================
	const {
		data: accountRes,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["account", id],
		queryFn: () => accountApi.getAccountById(id),
		enabled: !!id,
	});

	const account = accountRes?.data;

	
	// ================= STATES =================
	if (isLoading) {
		return (
			<div className="p-6 text-center text-muted-foreground">
				Loading account...
			</div>
		);
	}

	if (error) {
		return (
			<div className="p-6 text-center text-danger">
				Failed to load account
			</div>
		);
	}

	// ================= RENDER =================
	return (
		<>
			<PageHeader
				title="Account Details"
				subtitle="View account information, subscription, and payments"
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
				<AccountDetailsView
					account={account}
				/>
			</div>
		</>
	);
}
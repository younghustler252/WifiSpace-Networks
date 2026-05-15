"use client";

import { useRouter } from "next/navigation";

import AccountDetailsView from "@/components/pages/AccountDetailsView";
import PageHeader from "@/components/ui/PageHeader";
import { useAuth } from "@/context/AuthContext";

export default function Page() {
	const router = useRouter();

	// ================= AUTH =================
	const { activeAccount, isLoading } = useAuth();

	// ================= DUMMY DATA =================
	const subscription = {
		plan: "Fiber Unlimited 50Mbps",
		status: "active",
		expiry: "2026-05-10",
	};

	const payments = [
		{
			id: 1,
			amount: "₦15,000",
			method: "paystack",
			status: "success",
		},
		{
			id: 2,
			amount: "₦15,000",
			method: "bank_transfer",
			status: "pending",
		},
	];

	// ================= STATES =================
	if (isLoading) {
		return (
			<div className="p-6 text-center text-muted-foreground">
				Loading account...
			</div>
		);
	}

	if (!activeAccount) {
		return (
			<div className="p-6 text-center text-danger">
				No active account found
			</div>
		);
	}


	// ================= RENDER =================
	return (
		<>
			<PageHeader
				title={activeAccount.name || "My Account"}
				subtitle="Your account information, subscription, and payments"
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
					account={activeAccount}
					subscription={subscription}
					payments={payments}
				/>
			</div>
		</>
	);
}
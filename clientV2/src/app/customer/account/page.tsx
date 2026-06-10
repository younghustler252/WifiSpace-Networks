"use client";

import { useRouter } from "next/navigation";

import AccountPanel from "@/features/account/AccountPanel";
import PageHeader from "@/components/ui/PageHeader";
import { useAuth } from "@/context/AuthContext";

export default function Page() {
	const router = useRouter();

	// ================= AUTH =================
	const { activeAccount } = useAuth();

	
	// ================= STATES =================

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
				title={"My Account"}
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
				<AccountPanel
					account={activeAccount}
					role= "customer"
				/>
			</div>
		</>
	);
}
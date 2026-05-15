"use client";

import { useAuth } from "@/context/AuthContext";
import SubscriptionPanel from "@/components/pages/SubscriptionPanel";
import PageHeader from "@/components/ui/PageHeader";

export default function Page() {
	const { activeAccount, user } = useAuth();

	if (!activeAccount) {
		return (
			<div className="p-6 text-center text-danger">
				No active account found
			</div>
		);
	}

	return (
		<>
			<PageHeader title="My Subscription" />

			<div className="p-6">
				<SubscriptionPanel
					accountId={activeAccount.id}
					role={user?.role ?? "customer"} // 👈 fallback safe
				/>
			</div>
		</>
	);
}
"use client";

import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

import SubscriptionPanel from "@/features/subscription/SubscriptionPanel";
import PageHeader from "@/components/ui/PageHeader";

export default function Page() {
	const params = useParams();
	const id = params.id as string;
	type Role = "customer" | "staff" | "superadmin";


	const { user } = useAuth(); // 👈 get logged-in user

	if (!user) {
		return (
			<div className="p-6 text-center text-danger">
				Not authenticated
			</div>
		);
	}

	return (
		<>
			<PageHeader title="Account Subscription" />

			<div className="p-6">
				<SubscriptionPanel
					accountId={id}
					role={(user?.role as Role) ?? "customer"} 
				/>
			</div>
		</>
	);
}
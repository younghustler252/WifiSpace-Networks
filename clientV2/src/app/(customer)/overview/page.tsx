import type { Metadata } from "next";
import { AccountOverview } from "@/features/accounts/components/account-overview";

export const metadata: Metadata = { title: "Overview" };

export default function OverviewPage() {
	return <AccountOverview />;
}
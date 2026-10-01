import type { Metadata } from "next";
import { AccountDetail } from "@/features/accounts/components/account-detail";

export const metadata: Metadata = { title: "Account" };

export default async function AccountDetailPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	return <AccountDetail id={id} />;
}
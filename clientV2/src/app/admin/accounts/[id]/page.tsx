import type { Metadata } from "next";
import { AdminAccountView } from "@/features/accounts/components/admin-account-view";

export const metadata: Metadata = { title: "Account" };

export default async function AdminAccountPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	return <AdminAccountView id={id} />;
}
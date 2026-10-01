import type { Metadata } from "next";
import { AccountsAdmin } from "@/features/accounts/components/accounts-admin";

export const metadata: Metadata = { title: "Accounts" };

export default function AdminAccountsPage() {
	return <AccountsAdmin />;
}
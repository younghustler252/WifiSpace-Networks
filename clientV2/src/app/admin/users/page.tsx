import type { Metadata } from "next";
import { UsersAdmin } from "@/features/users/components/users-admin";

export const metadata: Metadata = { title: "Users" };

export default function AdminUsersPage() {
	return <UsersAdmin />;
}
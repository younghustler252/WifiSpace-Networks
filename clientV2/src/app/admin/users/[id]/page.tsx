import type { Metadata } from "next";
import { UserView } from "@/features/users/components/user-view";

export const metadata: Metadata = { title: "Customer" };

export default async function AdminUserPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	return <UserView id={id} />;
}
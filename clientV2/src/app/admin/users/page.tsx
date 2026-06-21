"use client";

import UsersTable from "@/features/user/UsersTable";

export default function AdminUsersPage() {
	return (
		<UsersTable
			scope="admin"
		/>
	);
}
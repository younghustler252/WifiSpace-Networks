"use client";

import { ReactNode } from "react";
import ProtectedRoute from "@/routes/ProtectedRoute";
import AppShell from "@/components/layout/AppShell";

interface UserLayoutProps {
	children: ReactNode;
}

const UserLayout = ({ children }: UserLayoutProps) => {
	return (
		<ProtectedRoute allowedRoles={["customer"]}>
			<AppShell>
				{children}
			</AppShell>
		</ProtectedRoute>
	);
};

export default UserLayout;
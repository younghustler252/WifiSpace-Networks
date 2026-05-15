"use client";

import { ReactNode } from "react";
import ProtectedRoute from "@/routes/ProtectedRoute";
import AppShell from "@/components/layout/AppShell";

interface AdminLayoutProps {
	children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
	return (
		<ProtectedRoute allowedRoles={["superadmin"]}>
			<AppShell>
				{children}
			</AppShell>
		</ProtectedRoute>
	);
};

export default AdminLayout;
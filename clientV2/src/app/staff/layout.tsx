"use client";

import { ReactNode } from "react";
import ProtectedRoute from "@/routes/ProtectedRoute";
import AppShell from "@/components/layout/AppShell";

interface StaffLayoutProps {
	children: ReactNode;
}

const StaffLayout = ({ children }: StaffLayoutProps) => {
	return (
		<ProtectedRoute allowedRoles={["staff"]}>
			<AppShell >
				{children}
			</AppShell>
		</ProtectedRoute>
	);
};

export default StaffLayout;
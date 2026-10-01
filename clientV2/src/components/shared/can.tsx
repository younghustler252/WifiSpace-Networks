"use client";

import { can, type Permission } from "@/lib/rbac";
import { useAuthStore } from "@/stores/auth.store";

interface CanProps {
	permission: Permission;
	fallback?: React.ReactNode;
	children: React.ReactNode;
}

export function Can({ permission, fallback = null, children }: CanProps) {
	const role = useAuthStore((s) => s.user?.role);
	return <>{can(role, permission) ? children : fallback}</>;
}
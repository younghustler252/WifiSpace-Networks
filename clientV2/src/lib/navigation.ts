import type { Role } from "@/types/roles";

export function getHomePath(role: Role) {
	return role === "customer" ? "/overview" : "/admin/dashboard";
}
export function safeNextPath(next: string | null) {
	if (!next || !next.startsWith("/") || next.startsWith("//")) return null;
	return next;
}
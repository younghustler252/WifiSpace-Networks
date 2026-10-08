import type { Role } from "@/types/roles";

export type Permission =
    | "admin:access"
    | "dashboard:revenue"
    | "users:change-role"
    | "users:impersonate"
    | "routers:manage"
    | "routers:reboot"
    | "payments:reverse";

const PERMISSIONS: Record<Permission, Role[]> = {
    "admin:access": ["staff", "superadmin"],
    "dashboard:revenue": ["superadmin"],
    "users:change-role": ["superadmin"],
    "users:impersonate": ["superadmin"],
    "routers:manage": ["superadmin"],
    "routers:reboot": ["superadmin"],
    "payments:reverse": ["superadmin"],
};

export function can(role: Role | undefined, permission: Permission) {
    return !!role && PERMISSIONS[permission].includes(role);
}
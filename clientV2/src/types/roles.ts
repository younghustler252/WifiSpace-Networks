export const ROLES = ["customer", "staff", "superadmin"] as const;
export type Role = (typeof ROLES)[number];
import { create } from "zustand";
import type { AuthUser } from "@/features/auth/types/auth.types";

type Status = "unknown" | "authenticated" | "guest";

export interface Impersonation {
	token: string;
	target: AuthUser;
	admin: AuthUser;
}

interface AuthState {
	user: AuthUser | null;
	status: Status;
	impersonation: Impersonation | null;
	setUser: (user: AuthUser) => void;
	clear: () => void;
	startImpersonation: (token: string, target: AuthUser) => void;
	stopImpersonation: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
	user: null,
	status: "unknown",
	impersonation: null,
	setUser: (user) => set({ user, status: "authenticated" }),
	clear: () => set({ user: null, status: "guest", impersonation: null }),
	startImpersonation: (token, target) =>
		set((s) => (s.user && !s.impersonation ? { impersonation: { token, target, admin: s.user }, user: target } : s)),
	stopImpersonation: () =>
		set((s) => (s.impersonation ? { user: s.impersonation.admin, impersonation: null } : s)),
}));
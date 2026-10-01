import type { Role } from "@/types/roles";

export interface AuthUser {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    avatar?: { url: string; publicId: string } | null;
    role: Role;
    isVerified: boolean;
    theme?: "light" | "dark" | "system";
}

export interface AuthSession {
    user: AuthUser;
    accessToken: string;
    refreshToken: string;
}

export interface RegisterResult {
	id: string;
	email: string;
	verificationSent: boolean;
	otpExpiresAt: string;
	mailError: string | null;
}
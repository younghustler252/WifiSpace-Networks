import { AuthShell } from "@/components/layout/auth-shell";
import { GuestGuard } from "@/features/auth/components/guest-guard";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
	return (
		<GuestGuard>
			<AuthShell>{children}</AuthShell>
		</GuestGuard>
	);
}
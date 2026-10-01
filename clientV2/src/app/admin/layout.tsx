import { AdminShell } from "@/components/layout/admin-shell";
import { AuthGuard } from "@/features/auth/components/auth-guard";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
	return (
		<AuthGuard allow={["staff", "superadmin"]}>
			<AdminShell>{children}</AdminShell>
		</AuthGuard>
	);
}
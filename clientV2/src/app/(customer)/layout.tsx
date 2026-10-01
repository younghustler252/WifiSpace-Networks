import { CustomerShell } from "@/components/layout/customer-shell";
import { AuthGuard } from "@/features/auth/components/auth-guard";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
	return (
		<AuthGuard>
			<CustomerShell>{children}</CustomerShell>
		</AuthGuard>
	);
}
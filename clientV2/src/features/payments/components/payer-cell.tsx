import { UserNameCell } from "@/features/users/components/user-name-cell";
import type { AdminPayment } from "../types/payments.types";

export function PayerCell({ payment }: { payment: AdminPayment }) {
	const user = payment.user;

	if (user && (user.firstName || user.email)) {
		return (
			<div className="min-w-0">
				<p className="truncate text-[13px] font-medium">{`${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.email}</p>
				{user.email && <p className="truncate text-[11px] text-muted-foreground">{user.email}</p>}
			</div>
		);
	}

	return <UserNameCell userId={payment.userId} />;
}
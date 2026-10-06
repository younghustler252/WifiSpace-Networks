import Link from "next/link";
import { UserNameCell } from "@/features/users/components/user-name-cell";
import type { AdminPayment } from "../types/payments.types";

export function PayerCell({ payment }: { payment: AdminPayment }) {
	const user = payment.user;

	if (user && (user.firstName || user.email)) {
		const name = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.email;

		return (
			<div className="min-w-0">
				{payment.userId ? (
					<Link href={`/admin/users/${payment.userId}`} className="block truncate text-[13px] font-medium hover:text-signal">
						{name}
					</Link>
				) : (
					<p className="truncate text-[13px] font-medium">{name}</p>
				)}
				{user.email && <p className="truncate text-[11px] text-muted-foreground">{user.email}</p>}
			</div>
		);
	}

	return <UserNameCell userId={payment.userId} link />;
}
import { Subscription } from "@/lib/api/subscription";

type Role =
	| "customer"
	| "staff"
	| "superadmin";

export function useSubscriptionStatus(
	subscription?: Subscription,
	role?: Role
) {
	const status =
		subscription?.status || "inactive";

	const isExpired =
		status === "expired";

	const isCanceled =
		status === "canceled";

	const isSuspended =
		status === "suspended";

	const isActive =
		status === "active";

	const isAdmin =
		role === "superadmin" ||
		role === "staff";

	const canManage =
		!!subscription && isAdmin;

	const canRenew =
		!!subscription && !isCanceled;

	return {
		status,
		isExpired,
		isCanceled,
		isSuspended,
		isActive,
		isAdmin,
		canManage,
		canRenew,
	};
}
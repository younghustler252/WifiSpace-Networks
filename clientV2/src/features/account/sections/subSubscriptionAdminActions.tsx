import { useSubscriptionActions } from "@/features/subscription/hooks/useSubscriptionActions";"use client";

import Button from "@/components/ui/Button";

import {
	Ban,
	Play,
	RefreshCw,
	XCircle,
	CalendarPlus,
} from "lucide-react";

import { Subscription } from "@/lib/api/subscription";


type Props = {
	accountId: string;

	subscription: Subscription;

	role?: "customer" | "superAdmin" | "staff";
};

const SubscriptionAdminActions = ({
	accountId,
	subscription,
	role = "customer",
}: Props) => {

	// =========================================
	// ONLY ADMIN/STAFF
	// =========================================

	if (role === "customer") {
		return null;
	}

	// =========================================
	// HOOK
	// =========================================

	const {
		suspendMutation,
		resumeMutation,
		cancelMutation,
		extendMutation,
		renewMutation,
		forceExpireMutation,
		isWorking,
	} = useSubscriptionActions({
		accountId,
		subscriptionId: subscription?.id,
	});

	// =========================================
	// UI
	// =========================================

	return (
		<div className="space-y-4">

			{/* TITLE */}
			<div>
				<h3 className="text-sm font-semibold">
					Admin Actions
				</h3>

				<p className="text-xs text-muted-foreground mt-1">
					Manage customer subscription lifecycle
				</p>
			</div>

			{/* ACTIONS */}
			<div className="grid grid-cols-2 lg:grid-cols-3 gap-3">

				{/* RENEW */}
				<Button
					onClick={() =>
						renewMutation.mutate()
					}
					disabled={isWorking}
					className="w-full"
				>
					<div className="flex items-center gap-2">
						<RefreshCw size={15} />
						Renew
					</div>
				</Button>

				{/* EXTEND */}
				<Button
					variant="outline"
					onClick={() =>
						extendMutation.mutate()
					}
					disabled={isWorking}
					className="w-full"
				>
					<div className="flex items-center gap-2">
						<CalendarPlus size={15} />
						Extend
					</div>
				</Button>

				{/* SUSPEND */}
				{subscription?.status === "active" && (
					<Button
						variant="outline"
						onClick={() =>
							suspendMutation.mutate(
								"Admin suspension"
							)
						}
						disabled={isWorking}
						className="w-full border-warning text-warning"
					>
						<div className="flex items-center gap-2">
							<Ban size={15} />
							Suspend
						</div>
					</Button>
				)}

				{/* RESUME */}
				{subscription?.status === "suspended" && (
					<Button
						onClick={() =>
							resumeMutation.mutate()
						}
						disabled={isWorking}
						className="w-full"
					>
						<div className="flex items-center gap-2">
							<Play size={15} />
							Resume
						</div>
					</Button>
				)}

				{/* CANCEL */}
				<Button
					variant="outline"
					onClick={() =>
						cancelMutation.mutate(
							"Admin cancellation"
						)
					}
					disabled={isWorking}
					className="w-full border-danger text-danger"
				>
					<div className="flex items-center gap-2">
						<XCircle size={15} />
						Cancel
					</div>
				</Button>

				{/* FORCE EXPIRE */}
				<Button
					variant="outline"
					onClick={() =>
						forceExpireMutation.mutate()
					}
					disabled={isWorking}
					className="w-full border-danger text-danger"
				>
					<div className="flex items-center gap-2">
						<XCircle size={15} />
						Force Expire
					</div>
				</Button>

			</div>

		</div>
	);
};

export default SubscriptionAdminActions;
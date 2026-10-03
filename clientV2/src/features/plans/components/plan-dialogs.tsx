"use client";

import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useAdminPlanActions } from "../hooks/use-plans";
import type { Plan } from "../types/plans.types";

interface PlanDialogProps {
	plan: Plan;
	onClose: () => void;
}

export function DeactivatePlanDialog({ plan, onClose }: PlanDialogProps) {
	const { deactivate } = useAdminPlanActions();

	return (
		<ConfirmDialog
			open
			onOpenChange={(open) => !open && onClose()}
			title={`Deactivate ${plan.name}?`}
			description="Customers can no longer buy this plan. Anyone already subscribed keeps it until it ends. You can reactivate it at any time."
			confirmLabel="Deactivate"
			onConfirm={async () => {
				const res = await deactivate.mutateAsync(plan.id);
				if (!res.success) {
					toast.error(res.message);
					return false;
				}
				toast.success("Plan deactivated");
			}}
		/>
	);
}

export function DeletePlanDialog({ plan, onClose }: PlanDialogProps) {
	const { remove } = useAdminPlanActions();

	return (
		<ConfirmDialog
			open
			onOpenChange={(open) => !open && onClose()}
			destructive
			requireText={plan.name}
			title={`Delete ${plan.name}?`}
			description="This removes the plan from the catalog. If you only want to stop new sales, deactivate it instead."
			confirmLabel="Delete plan"
			onConfirm={async () => {
				const res = await remove.mutateAsync(plan.id);
				if (!res.success) {
					toast.error(res.message);
					return false;
				}
				toast.success("Plan deleted");
			}}
		/>
	);
}
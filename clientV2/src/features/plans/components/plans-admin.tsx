"use client";

import { useMemo, useState } from "react";
import { Plus, Tag, WifiOff } from "lucide-react";
import { toast } from "sonner";
import { FILTER_ALL as ALL, FilterSelect } from "@/components/shared/filter-select";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { StatusMessage } from "@/components/shared/status-message";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PLAN_SERVICE_OPTIONS, PLAN_STATUS_OPTIONS } from "../constants";
import { useAdminPlanActions, useAdminPlans } from "../hooks/use-plans";
import type { Plan } from "../types/plans.types";
import { AdminPlansTable, type PlanAction } from "./admin-plans-table";
import { DeactivatePlanDialog, DeletePlanDialog } from "./plan-dialogs";
import { PlanFormDialog } from "./plan-form-dialog";

export function PlansAdmin() {
	const [service, setService] = useState(ALL);
	const [status, setStatus] = useState(ALL);
	const [creating, setCreating] = useState(false);
	const [dialog, setDialog] = useState<{ action: Exclude<PlanAction, "activate">; plan: Plan } | null>(null);
	const { data, isLoading, isError, refetch } = useAdminPlans();
	const { activate } = useAdminPlanActions();

	const items = useMemo(
		() =>
			(data ?? [])
				.filter((p) => service === ALL || p.serviceType === service)
				.filter((p) => status === ALL || p.status === status)
				.sort((a, b) => a.serviceType.localeCompare(b.serviceType) || a.price - b.price),
		[data, service, status]
	);

	const filtered = service !== ALL || status !== ALL;

	async function handleAction(action: PlanAction, plan: Plan) {
		if (action === "activate") {
			const res = await activate.mutateAsync(plan.id);
			if (res.success) toast.success("Plan activated");
			else toast.error(res.message);
			return;
		}
		setDialog({ action, plan });
	}

	function renderBody() {
		if (isLoading) return <Skeleton className="h-80 rounded-xl" />;

		if (isError || !data) {
			return (
				<StatusMessage icon={WifiOff} tone="warning" title="We couldn't load plans" text="Check your connection and try again.">
					<Button size="lg" className="w-full" onClick={() => refetch()}>
						Try again
					</Button>
				</StatusMessage>
			);
		}

		if (items.length === 0) {
			return (
				<StatusMessage
					icon={Tag}
					title={filtered ? "No plans match" : "No plans yet"}
					text={filtered ? "Try a different filter." : "Create your first plan so customers can start buying."}
				>
					{filtered ? (
						<Button
							size="lg"
							variant="outline"
							className="w-full bg-surface-2"
							onClick={() => {
								setService(ALL);
								setStatus(ALL);
							}}
						>
							Clear filters
						</Button>
					) : (
						<Button size="lg" className="w-full" onClick={() => setCreating(true)}>
							New plan
						</Button>
					)}
				</StatusMessage>
			);
		}

		return (
			<SectionCard title="Catalog" description={`${items.length} plan${items.length === 1 ? "" : "s"}`}>
				<AdminPlansTable items={items} onAction={handleAction} />
			</SectionCard>
		);
	}

	return (
		<div className="space-y-6">
			<PageHeader
				title="Plans"
				description="What customers can buy. Price changes only affect new purchases."
				actions={
					<Button onClick={() => setCreating(true)}>
						<Plus />
						New plan
					</Button>
				}
			/>

			<div className="flex flex-col gap-3 sm:flex-row">
				<FilterSelect value={service} onChange={setService} label="Service" allLabel="All services" options={PLAN_SERVICE_OPTIONS} />
				<FilterSelect value={status} onChange={setStatus} label="Status" allLabel="All statuses" options={PLAN_STATUS_OPTIONS} />
			</div>

			{renderBody()}

			{creating && <PlanFormDialog onClose={() => setCreating(false)} />}
			{dialog?.action === "edit" && <PlanFormDialog plan={dialog.plan} onClose={() => setDialog(null)} />}
			{dialog?.action === "deactivate" && <DeactivatePlanDialog plan={dialog.plan} onClose={() => setDialog(null)} />}
			{dialog?.action === "delete" && <DeletePlanDialog plan={dialog.plan} onClose={() => setDialog(null)} />}
		</div>
	);
}
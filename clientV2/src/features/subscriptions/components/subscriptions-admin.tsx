"use client";

import { useEffect, useState } from "react";
import { CalendarClock, Plus, WifiOff } from "lucide-react";
import { FILTER_ALL as ALL, FilterSelect } from "@/components/shared/filter-select";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { SimplePagination } from "@/components/shared/simple-pagination";
import { StatusMessage } from "@/components/shared/status-message";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PROVISIONING_STATUS_OPTIONS, SUBSCRIPTION_STATUS_OPTIONS } from "../constants";
import { useAdminSubscriptions } from "../hooks/use-subscriptions";
import type { SubscriptionAction } from "../lib/subscription-phase";
import type { Subscription } from "../types/subscriptions.types";
import { AdminSubscriptionsTable } from "./admin-subscriptions-table";
import { CreateSubscriptionDialog } from "./create-subscription-dialog";
import { SubscriptionActionDialog } from "./subscription-dialogs";

export function SubscriptionsAdmin() {
	const [status, setStatus] = useState(ALL);
	const [provisioning, setProvisioning] = useState(ALL);
	const [page, setPage] = useState(1);
	const [creating, setCreating] = useState(false);
	const [dialog, setDialog] = useState<{ action: SubscriptionAction; subscription: Subscription } | null>(null);

	useEffect(() => {
		setPage(1);
	}, [status, provisioning]);

	const { data, isLoading, isError, isPlaceholderData, refetch } = useAdminSubscriptions({
		status: status === ALL ? undefined : status,
		mikrotikStatus: provisioning === ALL ? undefined : provisioning,
		page,
	});
	const failedCount = useAdminSubscriptions({ mikrotikStatus: "failed", limit: 1 }).data?.meta?.total ?? 0;
	const filtered = status !== ALL || provisioning !== ALL;

	function renderBody() {
		if (isLoading) return <Skeleton className="h-96 rounded-xl" />;

		if (isError || !data) {
			return (
				<StatusMessage icon={WifiOff} tone="warning" title="We couldn't load subscriptions" text="Check your connection and try again.">
					<Button size="lg" className="w-full" onClick={() => refetch()}>
						Try again
					</Button>
				</StatusMessage>
			);
		}

		if (data.items.length === 0) {
			return (
				<StatusMessage
					icon={CalendarClock}
					title="No subscriptions found"
					text={filtered ? "Try different filters." : "Subscriptions appear here once customers buy a plan."}
				>
					{filtered && (
						<Button
							size="lg"
							variant="outline"
							className="w-full bg-surface-2"
							onClick={() => {
								setStatus(ALL);
								setProvisioning(ALL);
							}}
						>
							Clear filters
						</Button>
					)}
				</StatusMessage>
			);
		}

		return (
			<div className={isPlaceholderData ? "opacity-60 transition-opacity" : undefined}>
				<SectionCard
					title="All subscriptions"
					description={data.meta ? `${data.meta.total} subscription${data.meta.total === 1 ? "" : "s"}` : undefined}
				>
					<AdminSubscriptionsTable items={data.items} onAction={(action, subscription) => setDialog({ action, subscription })} />
				</SectionCard>
				<SimplePagination page={page} totalPages={data.meta?.totalPages ?? 1} onChange={setPage} className="mt-4" />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<PageHeader
				title="Subscriptions"
				description="Extend gives free time. Renew records a payment. Pick the right one from each row's menu."
				actions={
					<Button onClick={() => setCreating(true)}>
						<Plus />
						Create subscription
					</Button>
				}
			/>

			{failedCount > 0 && provisioning !== "failed" && (
				<div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3">
					<p className="text-[13px]">
						{failedCount} subscription{failedCount === 1 ? "" : "s"} failed to set up on the router. Those customers may not be online.
					</p>
					<Button size="sm" variant="outline" className="bg-surface-2" onClick={() => setProvisioning("failed")}>
						Show them
					</Button>
				</div>
			)}

			<div className="flex flex-col gap-3 sm:flex-row">
				<FilterSelect value={status} onChange={setStatus} label="Status" allLabel="All statuses" options={SUBSCRIPTION_STATUS_OPTIONS} />
				<FilterSelect value={provisioning} onChange={setProvisioning} label="Router setup" allLabel="Any router status" options={PROVISIONING_STATUS_OPTIONS} />
			</div>

			{renderBody()}

			{creating && <CreateSubscriptionDialog onClose={() => setCreating(false)} />}
			{dialog && <SubscriptionActionDialog action={dialog.action} subscription={dialog.subscription} onClose={() => setDialog(null)} />}
		</div>
	);
}
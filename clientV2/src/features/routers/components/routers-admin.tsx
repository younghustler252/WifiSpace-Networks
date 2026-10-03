"use client";

import { useState } from "react";
import { Plus, RefreshCw, Router, WifiOff } from "lucide-react";
import { toast } from "sonner";
import { Can } from "@/components/shared/can";
import { PageHeader } from "@/components/shared/page-header";
import { SimplePagination } from "@/components/shared/simple-pagination";
import { StatusMessage } from "@/components/shared/status-message";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ComposeNotificationDialog } from "@/features/notifications/components/compose-notification-dialog";
import { buildRouterOutagePreset } from "@/features/notifications/lib/presets";
import { useRouterActions, useRouters } from "../hooks/use-routers";
import type { NetworkRouter } from "../types/routers.types";
import { DeleteRouterDialog, RebootRouterDialog } from "./router-dialogs";
import { RouterCard, type RouterAction } from "./router-card";
import { RouterFormDialog } from "./router-form-dialog";

export function RoutersAdmin() {
	const [page, setPage] = useState(1);
	const [creating, setCreating] = useState(false);
	const [notifying, setNotifying] = useState<NetworkRouter | null>(null);
	const [dialog, setDialog] = useState<{ type: "reboot" | "delete"; router: NetworkRouter } | null>(null);
	const { data, isLoading, isError, isPlaceholderData, refetch } = useRouters({ page, limit: 12 });
	const { sync, syncAll } = useRouterActions();

	async function handleAction(action: RouterAction, router: NetworkRouter) {
		if (action === "sync") {
			const res = await sync.mutateAsync(router.id);
			if (res.success) toast.success(`Sync started for ${router.name}`);
			else toast.error(res.message);
			return;
		}

		if (action === "notify") {
			setNotifying(router);
			return;
		}

		setDialog({ type: action, router });
	}

	async function handleSyncAll() {
		const res = await syncAll.mutateAsync();
		if (res.success) toast.success("Syncing all routers");
		else toast.error(res.message);
	}

	function renderBody() {
		if (isLoading) {
			return (
				<div className="grid gap-4 lg:grid-cols-2">
					<Skeleton className="h-72 rounded-xl" />
					<Skeleton className="h-72 rounded-xl" />
				</div>
			);
		}

		if (isError || !data) {
			return (
				<StatusMessage icon={WifiOff} tone="warning" title="We couldn't load routers" text="Check your connection and try again.">
					<Button size="lg" className="w-full" onClick={() => refetch()}>
						Try again
					</Button>
				</StatusMessage>
			);
		}

		if (data.items.length === 0) {
			return <StatusMessage icon={Router} title="No routers yet" text="Add your first router to start provisioning customers." />;
		}

		return (
			<div className={isPlaceholderData ? "opacity-60 transition-opacity" : undefined}>
				<div className="grid gap-4 lg:grid-cols-2">
					{data.items.map((router) => (
						<RouterCard key={router.id} router={router} onAction={(action) => handleAction(action, router)} />
					))}
				</div>
				<SimplePagination page={page} totalPages={data.meta?.totalPages ?? 1} onChange={setPage} className="mt-4" />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<PageHeader
				title="Routers"
				description="MikroTik routers, their status and live sessions."
				actions={
					<div className="flex gap-3">
						<Button variant="outline" className="bg-surface-2" disabled={syncAll.isPending} onClick={handleSyncAll}>
							<RefreshCw className={syncAll.isPending ? "animate-spin" : undefined} />
							Sync all
						</Button>
						<Can permission="routers:manage">
							<Button onClick={() => setCreating(true)}>
								<Plus />
								Add router
							</Button>
						</Can>
					</div>
				}
			/>

			{renderBody()}

			{creating && <RouterFormDialog onClose={() => setCreating(false)} />}
			{dialog?.type === "reboot" && <RebootRouterDialog router={dialog.router} onClose={() => setDialog(null)} />}
			{dialog?.type === "delete" && <DeleteRouterDialog router={dialog.router} onClose={() => setDialog(null)} />}
			{notifying && <ComposeNotificationDialog preset={buildRouterOutagePreset(notifying)} onClose={() => setNotifying(null)} />}
		</div>
	);
}

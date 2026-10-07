"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DetailList } from "@/components/shared/detail-list";
import { Notice } from "@/components/shared/notice";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouters } from "@/features/routers/hooks/use-routers";
import type { NetworkRouter } from "@/features/routers/types/routers.types";
import { formatRelative } from "@/lib/format";
import { useAdminSubscriptionActions } from "../hooks/use-subscriptions";
import type { AdminSubscriptionDetail } from "../types/subscriptions.types";
import { settleFailure } from "@/lib/api/failure";

const isHotspot = (detail: AdminSubscriptionDetail) =>
	detail.account?.serviceType === "hotspot" || detail.subscription.planSnapshot.serviceType === "hotspot";

function RouterRow({ router }: { router: NetworkRouter }) {
	return (
		<li className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
			<div className="min-w-0">
				<p className="truncate text-[13px] font-medium">{router.name}</p>
				<p className="truncate text-[11px] text-muted-foreground">{[router.code, router.location].filter(Boolean).join(" · ")}</p>
			</div>
			<StatusBadge status={router.status ?? "offline"} />
		</li>
	);
}

function ResyncDialog({ detail, onClose }: { detail: AdminSubscriptionDetail; onClose: () => void }) {
	const { resync } = useAdminSubscriptionActions();
	const hotspot = isHotspot(detail);
	const known = detail.routers ?? [];
	const needsFallback = hotspot && known.length === 0;
	const allRouters = useRouters({ limit: 100 }, needsFallback);
	const [routerId, setRouterId] = useState(known.length === 1 ? known[0].id : "");

	const options: NetworkRouter[] =
		known.length > 0
			? known
			: (allRouters.data?.items ?? []).filter((r) => r.isEnabled !== false && (r.supportedServices ?? []).includes("hotspot"));

	const target = hotspot ? options.find((r) => r.id === routerId) : detail.router;
	const offline = !!target && target.status !== "online";

	function renderPicker() {
		if (needsFallback && allRouters.isLoading) return <Skeleton className="h-11 rounded-lg" />;
		if (options.length === 0) return <p className="text-sm text-muted-foreground">No router is available to provision on.</p>;

		return (
			<Select value={routerId || undefined} onValueChange={setRouterId}>
				<SelectTrigger className="w-full" aria-label="Router">
					<SelectValue placeholder="Choose a router" />
				</SelectTrigger>
				<SelectContent>
					{options.map((router) => (
						<SelectItem key={router.id} value={router.id}>
							{router.name}
							{router.location ? ` · ${router.location}` : ""}
							{router.status === "online" ? "" : ` · ${router.status ?? "offline"}`}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		);
	}

	return (
		<ConfirmDialog
			open
			onOpenChange={(open) => !open && onClose()}
			title="Re-sync provisioning?"
			description={
				hotspot
					? "Applies this subscription to the router you choose. Use it when the customer is at a different location or says they can't get online."
					: "Re-applies this subscription's profile to the customer's router. Use it when the last sync failed or the customer isn't online despite an active plan."
			}
			confirmLabel="Re-sync"
			confirmDisabled={hotspot && !routerId}
			onConfirm={async () => {
				const res = await resync.mutateAsync({ id: detail.subscription.id, routerId: hotspot ? routerId : undefined });
				if (!res.success) return settleFailure(res, "The re-sync");
				toast.success("Re-sync started");
			}}
		>
			{hotspot && renderPicker()}
			{offline && (
				<Notice
					tone="warning"
					title={`${target?.name ?? "This router"} is reported offline`}
					text="The sync will probably fail. If customers are connected through it, its status may be wrong, so ask the backend team to check its API connection."
				/>

			)}
			
		</ConfirmDialog>
	);
}

export function ProvisioningCard({ detail }: { detail: AdminSubscriptionDetail }) {
	const { subscription: s, router, routers } = detail;
	const [open, setOpen] = useState(false);
	const hotspot = isHotspot(detail);
	const failed = s.mikrotikStatus === "failed";
	const locations = hotspot ? routers : router ? [router] : [];

	const rows = [
		{ label: "Sync status", value: s.mikrotikStatus ? <StatusBadge status={s.mikrotikStatus} /> : "—" },
		{ label: "Last synced", value: s.mikrotikLastSyncAt ? formatRelative(s.mikrotikLastSyncAt) : "Never" },
		...(s.planSnapshot.mikrotikProfile ? [{ label: "Profile", value: <span className="text-mono">{s.planSnapshot.mikrotikProfile}</span> }] : []),
	];

	return (
		<SectionCard title="Provisioning" description={hotspot ? "Hotspot plans can be used across locations." : "Fixed installation."}>
			<div className="space-y-4">
				{(failed || s.mikrotikError) && <Notice tone="danger" title="Provisioning problem" text={s.mikrotikError ?? "The last sync failed."} />}
				{locations.some((r) => r.status !== "online") && (
					<Notice tone="warning" title="A router is reported offline" text="Changes made while it's unreachable may not reach it. Re-sync once it's back." />
				)}
				<DetailList rows={rows} />

				<div className="space-y-2">
					<p className="text-[11px] uppercase tracking-wider text-muted-foreground">{hotspot ? "Locations used" : "Router"}</p>
					{locations.length === 0 ? (
						<p className="text-[13px] text-muted-foreground">{hotspot ? "Not provisioned on any router yet." : "No router is linked."}</p>
					) : (
						<ul className="divide-y">
							{locations.map((location) => (
								<RouterRow key={location.id} router={location} />
							))}
						</ul>
					)}
				</div>

				<Button variant={failed ? "default" : "outline"} className={failed ? undefined : "bg-surface-2"} onClick={() => setOpen(true)}>
					<RefreshCw />
					Re-sync provisioning
				</Button>
			</div>
			{open && <ResyncDialog detail={detail} onClose={() => setOpen(false)} />}
		</SectionCard>
	);
}
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
import { describeRouterProblem, routerStatusLabel } from "@/features/routers/lib/router-health";

import { formatRelative } from "@/lib/format";
import { useAdminSubscriptionActions } from "../hooks/use-subscriptions";
import type { AdminSubscriptionDetail } from "../types/subscriptions.types";
import { settleFailure } from "@/lib/api/failure";
import { toastWithProvisioning } from "../lib/provisioning";

const isHotspot = (detail: AdminSubscriptionDetail) =>
	detail.account?.serviceType === "hotspot" || detail.subscription.planSnapshot.serviceType === "hotspot";

type RouterRef = Partial<NetworkRouter> & { routerId?: string; _id?: string };

function resolveRouters(refs: RouterRef[], all: NetworkRouter[]): NetworkRouter[] {
	return refs.map((ref) => {
		const id = ref.id ?? ref.routerId ?? ref._id;
		const match = all.find((r) => (id && r.id === id) || (ref.code && r.code === ref.code) || (ref.routerUid && r.routerUid === ref.routerUid));
		return { ...ref, ...match, id: match?.id ?? id ?? "", name: match?.name ?? ref.name ?? "", code: match?.code ?? ref.code ?? "" } as NetworkRouter;
	});
}

function problemFor(router: NetworkRouter) {
	return router.status ? describeRouterProblem(router) : null;
}

function RouterRow({ router }: { router: NetworkRouter }) {
	return (
		<li className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
			<div className="min-w-0">
				<p className="truncate text-[13px] font-medium">{router.name || router.code || "Unknown router"}</p>
				<p className="truncate text-[11px] text-muted-foreground">{[router.code, router.location].filter(Boolean).join(" · ")}</p>
			</div>
			{router.status ? <StatusBadge status={router.status} label={routerStatusLabel(router)} /> : <StatusBadge tone="neutral" label="Status unknown" />}
		</li>
	);
}

function ResyncDialog({ detail, onClose }: { detail: AdminSubscriptionDetail; onClose: () => void }) {
	const { resync } = useAdminSubscriptionActions();
	const hotspot = isHotspot(detail);
	const allRouters = useRouters({ limit: 100 }, hotspot);
	const everyRouter = allRouters.data?.items ?? [];
	const known = resolveRouters(detail.routers ?? [], everyRouter).filter((r) => r.id);
	const needsFallback = hotspot;
	const [routerId, setRouterId] = useState("");

	const options: NetworkRouter[] = everyRouter.filter((r) => r.isEnabled !== false && (r.supportedServices ?? []).includes("hotspot"));
	const usedIds = new Set(known.map((r) => r.id));
	const ordered = [...options.filter((r) => usedIds.has(r.id)), ...options.filter((r) => !usedIds.has(r.id))];

	const target = hotspot ? options.find((r) => r.id === routerId) : detail.router;
	const issue = target ? problemFor(target) : null;

	function renderPicker() {
		if (needsFallback && allRouters.isLoading) return <Skeleton className="h-11 rounded-lg" />;
		if (ordered.length === 0) return <p className="text-sm text-muted-foreground">No router is available to provision on.</p>;

		return (
			<Select value={routerId || undefined} onValueChange={setRouterId}>
				<SelectTrigger className="w-full" aria-label="Router">
					<SelectValue placeholder="Choose a router" />
				</SelectTrigger>
				<SelectContent>
					{ordered.map((router) => (
						<SelectItem key={router.id} value={router.id}>
							{router.name}
							{router.location ? ` · ${router.location}` : ""}
							{usedIds.has(router.id) ? " · used before" : ""}
							{router.status && router.status !== "online" ? ` · ${router.status}` : ""}
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
				toastWithProvisioning("Re-sync queued", res.data);
			}}
		>
			{hotspot && renderPicker()}
			{issue && (
				<Notice
					tone={issue.tone}
					title={issue.title}
					text="The re-sync is queued and retried automatically once the router's API is reachable."
				/>
			)}
		</ConfirmDialog>
	);
}

export function ProvisioningCard({ detail }: { detail: AdminSubscriptionDetail }) {
	const { subscription: s, router, routers: rawRouters } = detail;
	const allRouters = useRouters({ limit: 100 }, isHotspot(detail));
	const routers = resolveRouters(rawRouters ?? [], allRouters.data?.items ?? []);
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
				{(failed || (s.mikrotikError && s.mikrotikStatus !== "synced")) && <Notice tone="danger" title="Provisioning problem" text={s.mikrotikError ?? "The last sync failed."} />}
				{(() => {
					const flagged = locations
						.map((r) => ({ router: r, problem: problemFor(r) }))
						.find((x) => x.problem);

					return flagged?.problem ? (
						<Notice
							tone={flagged.problem.tone}
							title={`${flagged.router.name || flagged.router.code || "Router"}: ${flagged.problem.title}`}
							text={flagged.problem.text}
						/>
					) : null;
				})()}
				{s.mikrotikStatus === "pending" && (
					<Notice tone="info" title="Provisioning in progress" text="The router update is queued. This page refreshes on its own." />
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

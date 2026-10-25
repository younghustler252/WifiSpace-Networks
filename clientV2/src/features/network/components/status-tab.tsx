"use client";

import { useState } from "react";
import { Loader2, RefreshCw, WifiOff } from "lucide-react";
import { toast } from "sonner";
import { Can } from "@/components/shared/can";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { StatusMessage } from "@/components/shared/status-message";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { settleFailure } from "@/lib/api/failure";
import { formatDateTime } from "@/lib/format";
import { SYNC_STATUS_LABEL } from "../constants";
import { useNetworkStatus, useSyncActions } from "../hooks/use-network";
import type { RouterSyncStatus, SyncBlock, SyncOneResult, SyncResourceResult } from "../types/network.types";

const TONE = { synced: "success", partial: "warning", failed: "danger", never: "neutral" } as const;

function BlockLine({ label, block, onDetails }: { label: string; block: SyncBlock; onDetails: () => void }) {
	const counts = block.counts ?? {};
	const failed = block.failures?.length ?? 0;

	return (
		<div className="flex flex-wrap items-center justify-between gap-2 py-2">
			<div className="min-w-0 space-y-0.5">
				<p className="text-sm font-medium">{label}</p>
				<p className="text-[12px] text-muted-foreground">
					{block.lastSuccessAt ? `Last good sync ${formatDateTime(block.lastSuccessAt)}` : "Never synced"}
					{counts.created || counts.updated || counts.removed ? ` · ${counts.created ?? 0} added, ${counts.updated ?? 0} changed, ${counts.removed ?? 0} removed` : ""}
				</p>
			</div>
			<div className="flex items-center gap-2">
				{block.outOfDate ? (
					<StatusBadge tone="info" label="Syncing" />
				) : (
					<StatusBadge tone={TONE[block.status]} label={SYNC_STATUS_LABEL[block.status]} />
				)}
				{(failed > 0 || block.error) && (
					<Button variant="outline" size="sm" className="bg-surface-2" onClick={onDetails}>
						Details
					</Button>
				)}
			</div>
		</div>
	);
}

function FailureDialog({ router, block, label, onClose }: { router: string; block: SyncBlock; label: string; onClose: () => void }) {
	return (
		<Dialog open onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="max-h-[90svh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>
						{label} on {router}
					</DialogTitle>
					<DialogDescription>It will retry automatically on the next sync.</DialogDescription>
				</DialogHeader>
				<div className="space-y-3">
					{block.error && <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm">{block.error}</p>}
					{block.failures.map((failure) => (
						<div key={failure.name} className="rounded-lg border p-3">
							<p className="text-mono text-sm font-medium">{failure.name}</p>
							<p className="text-[12px] text-muted-foreground">{failure.error}</p>
						</div>
					))}
				</div>
			</DialogContent>
		</Dialog>
	);
}

function names(list?: SyncResourceResult["created"]) {
	return (list ?? []).map((item) => (typeof item === "string" ? item : item.name));
}

function PreviewDialog({ result, onClose }: { result: SyncOneResult; onClose: () => void }) {
	const sections = [
		{ label: "Speed profiles", data: result.profiles },
		{ label: "Walled garden", data: result.walledGarden },
	];

	return (
		<Dialog open onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="max-h-[90svh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Changes for {result.router}</DialogTitle>
					<DialogDescription>Nothing has been changed on the router.</DialogDescription>
				</DialogHeader>
				<div className="space-y-4">
					{result.skipped && <p className="text-sm text-muted-foreground">This router was skipped: {result.skipped.replaceAll("_", " ")}.</p>}
					{result.error && <p className="text-sm text-destructive">{result.error === "credentials_missing" ? "This router's login details are missing." : result.error}</p>}
					{sections.map(({ label, data }) => {
						if (!data) return null;
						const groups = [
							{ title: "Will be added", items: names(data.created) },
							{ title: "Will be changed", items: names(data.updated) },
							{ title: "Will be removed", items: names(data.removed) },
						].filter((g) => g.items.length > 0);

						return (
							<div key={label} className="space-y-2">
								<p className="text-sm font-medium">{label}</p>
								{data.error && <p className="text-[12px] text-destructive">{data.error}</p>}
								{groups.length === 0 && !data.error && <p className="text-[12px] text-muted-foreground">Already up to date{data.unchanged ? ` (${data.unchanged} unchanged)` : ""}.</p>}
								{groups.map((g) => (
									<div key={g.title} className="rounded-lg border p-3">
										<p className="text-[11px] uppercase tracking-wider text-muted-foreground">{g.title}</p>
										<p className="text-mono text-[13px]">{g.items.join(", ")}</p>
									</div>
								))}
							</div>
						);
					})}
				</div>
			</DialogContent>
		</Dialog>
	);
}

function RouterCard({ router }: { router: RouterSyncStatus }) {
	const { router: sync } = useSyncActions();
	const [details, setDetails] = useState<{ label: string; block: SyncBlock } | null>(null);
	const [preview, setPreview] = useState<SyncOneResult | null>(null);
	const busy = sync.isPending;

	async function run(dryRun: boolean) {
		const res = await sync.mutateAsync({ routerId: router.id, resources: "all", dryRun });
		if (!res.success) {
			if (settleFailure(res, "The sync")) return;
			return;
		}
		if (dryRun) setPreview(res.data);
		else toast.success(`${router.name} synced`);
	}

	return (
		<SectionCard
			title={router.name}
			description={router.code}
			actions={
				<Can permission="network:manage">
					<div className="flex gap-2">
						<Button variant="outline" size="sm" className="bg-surface-2" disabled={busy} onClick={() => run(true)}>
							Preview
						</Button>
						<Button size="sm" disabled={busy} onClick={() => run(false)}>
							{busy ? <Loader2 className="animate-spin" /> : <RefreshCw />}
							Sync
						</Button>
					</div>
				</Can>
			}
		>
			<div className="divide-y">
				<BlockLine label="Speed profiles" block={router.profiles} onDetails={() => setDetails({ label: "Speed profiles", block: router.profiles })} />
				<BlockLine label="Walled garden" block={router.walledGarden} onDetails={() => setDetails({ label: "Walled garden", block: router.walledGarden })} />
			</div>
			{details && <FailureDialog router={router.name} label={details.label} block={details.block} onClose={() => setDetails(null)} />}
			{preview && <PreviewDialog result={preview} onClose={() => setPreview(null)} />}
		</SectionCard>
	);
}

export function StatusTab() {
	const status = useNetworkStatus();

	if (status.isLoading) return <Skeleton className="h-64 rounded-xl" />;

	if (status.isError || !status.data) {
		return (
			<StatusMessage icon={WifiOff} tone="warning" title="We couldn't load sync status" text="Check your connection and try again.">
				<Button size="lg" className="w-full" onClick={() => status.refetch()}>
					Try again
				</Button>
			</StatusMessage>
		);
	}

	if (status.data.length === 0) {
		return <p className="py-10 text-center text-sm text-muted-foreground">No routers to sync yet.</p>;
	}

	return (
		<div className="space-y-4">
			<p className="text-[12px] text-muted-foreground">Changes are pushed to your routers in the background, and everything is re-checked every 6 hours.</p>
			{status.data.map((router) => (
				<RouterCard key={router.id} router={router} />
			))}
		</div>
	);
}

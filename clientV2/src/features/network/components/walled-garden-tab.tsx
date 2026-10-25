"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2, WifiOff } from "lucide-react";
import { toast } from "sonner";
import { Can } from "@/components/shared/can";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { StatusMessage } from "@/components/shared/status-message";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { settleFailure } from "@/lib/api/failure";
import { useEntryActions, useWalledGarden } from "../hooks/use-network";
import type { WalledGardenEntry } from "../types/network.types";
import { WalledGardenDialog } from "./walled-garden-dialog";

function target(entry: WalledGardenEntry) {
	const base = entry.kind === "host" ? entry.dstHost : (entry.dstAddress ?? entry.dstHost);
	const port = entry.dstPort ? `:${entry.dstPort}` : "";
	const path = entry.path ?? "";
	return `${base ?? "—"}${port}${path}`;
}

export function WalledGardenTab() {
	const entries = useWalledGarden();
	const { update, remove } = useEntryActions();
	const [editing, setEditing] = useState<WalledGardenEntry | "new" | null>(null);
	const [deleting, setDeleting] = useState<WalledGardenEntry | null>(null);

	async function toggle(entry: WalledGardenEntry, enabled: boolean) {
		const res = await update.mutateAsync({ id: entry.id, body: { enabled } });
		if (!res.success) toast.error(res.message);
	}

	if (entries.isLoading) return <Skeleton className="h-64 rounded-xl" />;

	if (entries.isError || !entries.data) {
		return (
			<StatusMessage icon={WifiOff} tone="warning" title="We couldn't load the walled garden" text="Check your connection and try again.">
				<Button size="lg" className="w-full" onClick={() => entries.refetch()}>
					Try again
				</Button>
			</StatusMessage>
		);
	}

	return (
		<SectionCard
			title="Walled garden"
			description="Sites customers can open before they log in, like Paystack and your support links."
			actions={
				<Can permission="network:manage">
					<Button size="sm" onClick={() => setEditing("new")}>
						<Plus />
						Add entry
					</Button>
				</Can>
			}
		>
			{entries.data.length === 0 ? (
				<p className="py-6 text-center text-sm text-muted-foreground">No entries yet. Use Import to bring in what's already on your routers.</p>
			) : (
				<ul className="divide-y">
					{entries.data.map((entry) => (
						<li key={entry.id} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
							<div className="min-w-0 space-y-1">
								<div className="flex flex-wrap items-center gap-2">
									<p className="text-mono truncate text-sm font-medium">{target(entry)}</p>
									<StatusBadge tone={entry.action === "allow" || entry.action === "accept" ? "success" : "danger"} label={entry.action} />
									{!entry.enabled && <StatusBadge tone="neutral" label="Off" />}
								</div>
								<p className="text-[12px] text-muted-foreground">
									{entry.kind === "host" ? "Website" : `IP${entry.protocol ? ` · ${entry.protocol}` : ""}`}
									{entry.description ? ` · ${entry.description}` : ""}
								</p>
							</div>
							<Can permission="network:manage">
								<div className="flex shrink-0 items-center gap-2">
									<Switch checked={entry.enabled} disabled={update.isPending} onCheckedChange={(checked) => toggle(entry, checked)} aria-label="Turn entry on or off" />
									<Button variant="outline" size="sm" className="bg-surface-2" onClick={() => setEditing(entry)}>
										<Pencil />
										Edit
									</Button>
									<Button variant="outline" size="sm" className="bg-surface-2 text-destructive" onClick={() => setDeleting(entry)}>
										<Trash2 />
										Delete
									</Button>
								</div>
							</Can>
						</li>
					))}
				</ul>
			)}

			{editing && <WalledGardenDialog entry={editing === "new" ? undefined : editing} onClose={() => setEditing(null)} />}

			{deleting && (
				<ConfirmDialog
					open
					destructive
					onOpenChange={(open) => !open && setDeleting(null)}
					title="Delete this entry?"
					description={`${target(deleting)} will be removed from every router in the background.`}
					confirmLabel="Delete entry"
					onConfirm={async () => {
						const res = await remove.mutateAsync(deleting.id);
						if (!res.success) return settleFailure(res, "The delete");
						toast.success("Entry deleted");
					}}
				/>
			)}
		</SectionCard>
	);
}

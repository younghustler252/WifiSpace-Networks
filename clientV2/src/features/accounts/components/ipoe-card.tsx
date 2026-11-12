"use client";

import { useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Field } from "@/components/shared/field";
import { Notice } from "@/components/shared/notice";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatMac } from "@/lib/format";
import { settleFailure } from "@/lib/api/failure";
import { ACCOUNT_ERROR_CODES } from "../constants";
import { useAdminAccountActions } from "../hooks/use-accounts";
import { macMessage, parseMac } from "../lib/mac";
import type { AdminAccount, IpoeReconcileResult, IpoeReconcileRow } from "../types/accounts.types";
import { MacInput } from "./mac-input";

const ROW_TONE = { would_link: "info", linked: "success", already_linked: "neutral", skipped: "warning", unmatched: "warning", failed: "danger", router_failed: "danger" } as const;

function EditMacDialog({ account, onClose }: { account: AdminAccount; onClose: () => void }) {
	const { update } = useAdminAccountActions();
	const [mac, setMac] = useState(account.macAddress ?? "");
	const [error, setError] = useState<string | null>(null);

	async function submit() {
		const message = macMessage(mac);
		if (message) {
			setError(message);
			return;
		}

		const res = await update.mutateAsync({ id: account.id, body: { macAddress: parseMac(mac)! } });
		if (!res.success) {
			if (res.code === ACCOUNT_ERROR_CODES.MAC_ADDRESS_INVALID || res.code === "VALIDATION_ERROR" || res.code === ACCOUNT_ERROR_CODES.FIELD_NOT_EDITABLE) {
				setError(res.message);
				return;
			}
			if (settleFailure(res, "Saving the MAC")) onClose();
			return;
		}

		toast.success("MAC address saved");
		onClose();
	}

	return (
		<Dialog open onOpenChange={(open) => !open && !update.isPending && onClose()}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{account.macAddress ? "Change MAC address" : "Add MAC address"}</DialogTitle>
					<DialogDescription>Type it any way you like. We tidy it up and show you the final form before saving.</DialogDescription>
				</DialogHeader>
				<div className="space-y-5">
					<Field label="Customer router MAC" htmlFor="edit-mac" error={error ?? undefined}>
						<MacInput id="edit-mac" value={mac} invalid={!!error} onChange={(value) => { setMac(value); setError(null); }} />
					</Field>
					<Button size="lg" className="w-full" disabled={update.isPending} onClick={submit}>
						{update.isPending && <Loader2 className="animate-spin" />}
						Save MAC address
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}

function ResultRows({ rows }: { rows: IpoeReconcileRow[] }) {
	const shown = rows.filter((r) => r.status !== "already_linked");
	if (shown.length === 0) return <p className="text-[13px] text-muted-foreground">Everything already matches.</p>;

	return (
		<ul className="divide-y rounded-lg border">
			{shown.map((row, index) => (
				<li key={`${row.router}-${row.wsnId}-${index}`} className="space-y-1 p-3">
					<div className="flex flex-wrap items-center justify-between gap-2">
						<p className="text-mono text-[13px] font-medium">{row.wsnId ?? "No account"}</p>
						<StatusBadge tone={ROW_TONE[row.status]} label={row.status.replaceAll("_", " ")} />
					</div>
					<p className="text-[12px] text-muted-foreground">
						{row.router}
						{row.macAddress ? ` · ${formatMac(row.macAddress)}` : ""}
						{row.reason ? ` · ${row.reason.replaceAll("_", " ")}` : ""}
					</p>
				</li>
			))}
		</ul>
	);
}

export function SyncFromRouterDialog({ account, onClose }: { account?: AdminAccount; onClose: () => void }) {
	const { reconcileIpoe, reconcileAllIpoe } = useAdminAccountActions();
	const [result, setResult] = useState<IpoeReconcileResult | null>(null);
	const [applied, setApplied] = useState(false);
	const [routerFilter, setRouterFilter] = useState("");
	const pending = reconcileIpoe.isPending || reconcileAllIpoe.isPending;

	async function run(apply: boolean) {
		const res = account
			? await reconcileIpoe.mutateAsync({ id: account.id, body: { apply } })
			: await reconcileAllIpoe.mutateAsync({ apply, routerFilter: routerFilter.trim() || undefined });

		if (!res.success) {
			if (settleFailure(res, "The sync")) onClose();
			return;
		}

		setResult(res.data);
		setApplied(apply);
		if (apply) toast.success("Synced from the router");
	}

	const wouldChange = (result?.summary.wouldLink ?? 0) > 0;

	return (
		<Dialog open onOpenChange={(open) => !open && !pending && onClose()}>
			<DialogContent className="max-h-[90svh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>{account ? "Sync from router" : "Sync all IPoE accounts"}</DialogTitle>
					<DialogDescription>Matches {account ? "this WSN ID" : "WSN IDs"} against the users already on your routers. Preview first.</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					<Notice tone="warning" title="Applying overwrites what's saved" text="The MAC and router in the database are replaced with what the router has. Only apply if the router is the one that's right." />

					{!account && !result && (
						<Field label="Only this router (optional)" htmlFor="sync-router" hint="A router code like RT-293238. Leave empty for all.">
							<input id="sync-router" value={routerFilter} onChange={(e) => setRouterFilter(e.target.value)} className="h-11 w-full rounded-lg border bg-background px-3 text-sm" />
						</Field>
					)}

					{result && account && result.found === false && <Notice tone="warning" title="Not found on any router" text={`${account.wsnId} isn't a user on any online router.`} />}

					{result && (
						<div className="space-y-3">
							<p className="text-sm font-medium">
								{applied ? "Done" : "Preview"}: {applied ? result.summary.linked : result.summary.wouldLink} {applied ? "linked" : "to link"} · {result.summary.alreadyLinked} already linked · {result.summary.unmatchedOnRouter} not matched
								{result.summary.failed ? ` · ${result.summary.failed} failed` : ""}
							</p>
							{!result.complete && <Notice tone="warning" title="Some routers couldn't be checked" text="This is a partial result. Run it again when they're reachable." />}
							<ResultRows rows={result.rows} />
						</div>
					)}

					{applied ? (
						<Button size="lg" className="w-full" onClick={onClose}>
							Done
						</Button>
					) : result ? (
						<Button size="lg" className="w-full" disabled={pending || !wouldChange} onClick={() => run(true)}>
							{pending && <Loader2 className="animate-spin" />}
							{wouldChange ? "Apply changes" : "Nothing to apply"}
						</Button>
					) : (
						<Button size="lg" className="w-full" disabled={pending} onClick={() => run(false)}>
							{pending && <Loader2 className="animate-spin" />}
							Preview
						</Button>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}

export function IpoeCard({ account }: { account: AdminAccount }) {
	const [editing, setEditing] = useState(false);
	const [syncing, setSyncing] = useState(false);

	if (account.accessMethod !== "ipoe" || account.approvalStatus !== "approved") return null;

	return (
		<SectionCard
			title="IPoE binding"
			description="The customer's router is identified by its MAC address."
			actions={
				<div className="flex gap-2">
					<Button variant="outline" size="sm" className="bg-surface-2" onClick={() => setSyncing(true)}>
						<RefreshCw />
						Sync
					</Button>
					<Button variant="outline" size="sm" className="bg-surface-2" onClick={() => setEditing(true)}>
						{account.macAddress ? "Change" : "Add MAC"}
					</Button>
				</div>
			}
		>
			{account.macAddress ? (
				<p className="text-mono text-sm">{formatMac(account.macAddress)}</p>
			) : (
				<Notice
					tone="warning"
					title="MAC address not set yet"
					text="It's filled in automatically from the router when the customer first subscribes, if their WSN ID is already there. Or add it now."
				/>
			)}
			{editing && <EditMacDialog account={account} onClose={() => setEditing(false)} />}
			{syncing && <SyncFromRouterDialog account={account} onClose={() => setSyncing(false)} />}
		</SectionCard>
	);
}

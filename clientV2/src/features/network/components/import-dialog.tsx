"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Notice } from "@/components/shared/notice";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { settleFailure } from "@/lib/api/failure";
import { useImportConfig, useNetworkStatus } from "../hooks/use-network";
import type { ConfigResources, ImportResult } from "../types/network.types";

const ALL_ROUTERS = "all";

const RESOURCE_OPTIONS: { value: ConfigResources; label: string }[] = [
	{ value: "all", label: "Profiles and walled garden" },
	{ value: "profiles", label: "Speed profiles only" },
	{ value: "walled-garden", label: "Walled garden only" },
];

function Summary({ result }: { result: ImportResult }) {
	const { profiles, walledGarden } = result;
	const applied = result.mode === "applied";

	return (
		<div className="space-y-3 text-sm">
			<p className="font-medium">{applied ? "Imported" : "This will import"}</p>
			<ul className="space-y-1 text-[13px]">
				<li>
					{profiles.imported.length} profile{profiles.imported.length === 1 ? "" : "s"}
					{profiles.imported.length > 0 && <span className="text-mono text-muted-foreground"> · {profiles.imported.map((p) => p.name).join(", ")}</span>}
				</li>
				<li>
					{walledGarden.imported.length} walled garden {walledGarden.imported.length === 1 ? "entry" : "entries"}
				</li>
				<li className="text-muted-foreground">{profiles.alreadyManaged + walledGarden.alreadyManaged} already managed</li>
			</ul>
			{profiles.conflicts.length > 0 && (
				<Notice tone="warning" title={`${profiles.conflicts.length} profile conflict${profiles.conflicts.length === 1 ? "" : "s"}`} text={profiles.conflicts.map((c) => `${c.name} on ${c.router}: ${c.note}`).join(" · ")} />
			)}
			{profiles.skipped.length > 0 && (
				<Notice tone="info" title={`${profiles.skipped.length} skipped`} text={profiles.skipped.map((s) => `${s.name} on ${s.router}: ${s.reason}`).join(" · ")} />
			)}
			{result.unreachable.length > 0 && (
				<Notice tone="danger" title="Some routers couldn't be reached" text={result.unreachable.map((u) => `${u.router}: ${u.error}`).join(" · ")} />
			)}
		</div>
	);
}

export function ImportDialog({ onClose }: { onClose: () => void }) {
	const routers = useNetworkStatus();
	const importConfig = useImportConfig();
	const [resources, setResources] = useState<ConfigResources>("all");
	const [routerId, setRouterId] = useState(ALL_ROUTERS);
	const [result, setResult] = useState<ImportResult | null>(null);

	function reset() {
		setResult(null);
	}

	async function run(apply: boolean) {
		const res = await importConfig.mutateAsync({ resources, routerId: routerId === ALL_ROUTERS ? undefined : routerId, apply });

		if (!res.success) {
			if (settleFailure(res, "The import")) onClose();
			return;
		}

		setResult(res.data);
		if (apply) toast.success("Import finished", { description: "Importing again is safe." });
	}

	const applied = result?.mode === "applied";
	const nothing = !!result && result.profiles.imported.length === 0 && result.walledGarden.imported.length === 0;

	return (
		<Dialog open onOpenChange={(open) => !open && !importConfig.isPending && onClose()}>
			<DialogContent className="max-h-[90svh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Import from routers</DialogTitle>
					<DialogDescription>Bring in what's already set up on your routers so the portal can manage it. Always preview first.</DialogDescription>
				</DialogHeader>

				<div className="space-y-5">
					{!applied && (
						<>
							<Select value={resources} onValueChange={(v) => { setResources(v as ConfigResources); reset(); }}>
								<SelectTrigger className="w-full" aria-label="What to import">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{RESOURCE_OPTIONS.map((o) => (
										<SelectItem key={o.value} value={o.value}>
											{o.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>

							<Select value={routerId} onValueChange={(v) => { setRouterId(v); reset(); }}>
								<SelectTrigger className="w-full" aria-label="Which router">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value={ALL_ROUTERS}>All routers</SelectItem>
									{(routers.data ?? []).map((r) => (
										<SelectItem key={r.id} value={r.id}>
											{r.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</>
					)}

					{result && <Summary result={result} />}

					{applied ? (
						<Button size="lg" className="w-full" onClick={onClose}>
							Done
						</Button>
					) : result ? (
						<Button size="lg" className="w-full" disabled={importConfig.isPending || nothing} onClick={() => run(true)}>
							{importConfig.isPending && <Loader2 className="animate-spin" />}
							{nothing ? "Nothing to import" : "Import now"}
						</Button>
					) : (
						<Button size="lg" className="w-full" disabled={importConfig.isPending} onClick={() => run(false)}>
							{importConfig.isPending && <Loader2 className="animate-spin" />}
							Preview import
						</Button>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}

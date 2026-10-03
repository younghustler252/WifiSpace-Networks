import { MoreHorizontal } from "lucide-react";
import { Can } from "@/components/shared/can";
import { InfoTile } from "@/components/shared/info-tile";
import { Notice } from "@/components/shared/notice";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { featureFlags } from "@/lib/feature-flags";
import { formatRelative } from "@/lib/format";
import type { NetworkRouter } from "../types/routers.types";

export type RouterAction = "sync" | "reboot" | "delete" | "notify";

interface RouterCardProps {
	router: NetworkRouter;
	onAction: (action: RouterAction) => void;
}

const SERVICE_LABELS: Record<string, string> = { pppoe: "PPPoE", hotspot: "Hotspot" };

export function RouterCard({ router, onAction }: RouterCardProps) {
	const description = [router.code, router.location].filter(Boolean).join(" · ");
	const sessions = router.currentSessions ?? 0;

	return (
		<SectionCard
			title={router.name}
			description={description}
			actions={
				<div className="flex items-center gap-1">
					<StatusBadge status={router.status ?? "offline"} />
					<DropdownMenu modal={false}>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="icon" aria-label={`Actions for ${router.name}`}>
								<MoreHorizontal className="size-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-44">
							<DropdownMenuItem onSelect={() => onAction("sync")}>Sync now</DropdownMenuItem>
							{featureFlags.routerBroadcast && (
								<DropdownMenuItem onSelect={() => onAction("notify")}>Notify customers…</DropdownMenuItem>
							)}
							<Can permission="routers:reboot">
								<DropdownMenuSeparator />
								<DropdownMenuItem onSelect={() => onAction("reboot")}>Reboot…</DropdownMenuItem>
							</Can>
							<Can permission="routers:manage">
								<DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={() => onAction("delete")}>
									Delete…
								</DropdownMenuItem>
							</Can>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			}
		>
			<div className="space-y-4">
				<div className="flex flex-wrap items-center gap-2">
					{router.isDefaultRouter && <StatusBadge status="active" label="Default" />}
					{router.isEnabled === false && <StatusBadge status="paused" label="Disabled" />}
					{(router.supportedServices ?? []).map((service) => (
						<span key={service} className="rounded-full border px-2 py-0.5 text-[11px] text-muted-foreground">
							{SERVICE_LABELS[service] ?? service}
						</span>
					))}
				</div>

				{router.lastError && <Notice tone="danger" title="Last error" text={router.lastError} />}

				{featureFlags.routerBroadcast && router.status !== "online" && (
					<Button variant="outline" size="sm" className="bg-surface-2" onClick={() => onAction("notify")}>
						Notify affected customers
					</Button>
				)}

				<div className="grid grid-cols-2 gap-3">
					<InfoTile
						label="Sessions"
						value={sessions}
						hint={router.maxSessions ? `of ${router.maxSessions}` : "online now"}
					/>
					<InfoTile label="Last seen" value={router.lastSeenAt ? formatRelative(router.lastSeenAt) : "Never"} mono={false} />
					<InfoTile label="RouterOS" value={router.routerOsVersion ?? "—"} />
					<InfoTile
						label="Agent"
						value={router.agentStatus ? <StatusBadge status={router.agentStatus} /> : "—"}
						mono={false}
					/>
					<InfoTile label="Address" value={router.host ? `${router.host}${router.port ? `:${router.port}` : ""}` : "—"} className="col-span-2" />
				</div>
			</div>
		</SectionCard>
	);
}

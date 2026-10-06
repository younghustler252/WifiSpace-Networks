"use client";

import { useState } from "react";
import Link from "next/link";
import { Smartphone } from "lucide-react";
import { SectionCard } from "@/components/shared/section-card";
import { SimplePagination } from "@/components/shared/simple-pagination";
import { StatusBadge } from "@/components/shared/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useHotspotDevices, useHotspotLocations } from "@/features/hotspots/hooks/use-hotspots";
import { formatMac, formatRelative } from "@/lib/format";
import type { AdminAccount } from "../types/accounts.types";

const placeOf = (router: { name: string; location?: string | null } | null) =>
	router ? [router.name, router.location].filter(Boolean).join(" · ") : "Router unknown";

interface DevicesCardProps {
	params: { accountId?: string; userId?: string };
	maxDevices?: number;
	accountLabels?: Record<string, string>;
}

function DevicesCard({ params, maxDevices, accountLabels }: DevicesCardProps) {
	const [page, setPage] = useState(1);
	const { data, isLoading, isError, isPlaceholderData } = useHotspotDevices(params, page);

	function renderBody() {
		if (isLoading) return <Skeleton className="h-24 rounded-lg" />;
		if (isError || !data) return <p className="text-[13px] text-muted-foreground">Devices aren&apos;t available right now.</p>;
		if (data.items.length === 0) return <p className="text-[13px] text-muted-foreground">No device has connected yet.</p>;

		const sorted = [...data.items].sort((a, b) => new Date(b.lastSeenAt).getTime() - new Date(a.lastSeenAt).getTime());

		return (
			<div className={isPlaceholderData ? "opacity-60 transition-opacity" : undefined}>
				<ul className="divide-y">
					{sorted.map((device) => (
						<li key={device.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
							<span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
								<Smartphone className="size-4" />
							</span>
							<div className="min-w-0 flex-1">
								<p className="text-mono truncate text-[13px]">{formatMac(device.macAddress)}</p>
								<p className="truncate text-[11px] text-muted-foreground">
									{accountLabels?.[device.accountId] ? `${accountLabels[device.accountId]} · ` : ""}
									{placeOf(device.router)}
								</p>
								<p className="text-[11px] text-muted-foreground">
									Last seen {formatRelative(device.lastSeenAt)}
									{device.ipAddress ? ` · ${device.ipAddress}` : ""}
								</p>
							</div>
							<div className="flex flex-col items-end gap-1">
								<StatusBadge status={device.status} />
								{device.trustedDevice && <span className="text-[11px] text-muted-foreground">Trusted</span>}
							</div>
						</li>
					))}
				</ul>
				<SimplePagination page={page} totalPages={data.meta?.totalPages ?? 1} onChange={setPage} className="mt-4" />
			</div>
		);
	}

	const total = data?.meta?.total;

	return (
		<SectionCard
			title="Devices"
			description={
				total !== undefined && maxDevices !== undefined
					? `${total} of ${maxDevices} allowed. Each shows where it last connected.`
					: "Physical devices and where they last connected."
			}
		>
			{renderBody()}
		</SectionCard>
	);
}

export function HotspotDevicesCard({ account }: { account: AdminAccount }) {
	return <DevicesCard params={{ accountId: account.id }} maxDevices={account.maxDevices} />;
}

export function UserDevicesCard({ userId, accountLabels }: { userId: string; accountLabels?: Record<string, string> }) {
	return <DevicesCard params={{ userId }} accountLabels={accountLabels} />;
}

export function HotspotLocationsCard({ accountId }: { accountId: string }) {
	const [page, setPage] = useState(1);
	const { data, isLoading, isError, isPlaceholderData } = useHotspotLocations(accountId, page);

	function renderBody() {
		if (isLoading) return <Skeleton className="h-24 rounded-lg" />;
		if (isError || !data) return <p className="text-[13px] text-muted-foreground">Locations aren&apos;t available right now.</p>;
		if (data.items.length === 0) return <p className="text-[13px] text-muted-foreground">This account hasn&apos;t been provisioned on any router yet.</p>;

		const sorted = [...data.items].sort(
			(a, b) => new Date(b.lastSyncedAt ?? b.createdAt).getTime() - new Date(a.lastSyncedAt ?? a.createdAt).getTime()
		);

		return (
			<div className={isPlaceholderData ? "opacity-60 transition-opacity" : undefined}>
				<ul className="divide-y">
					{sorted.map((location) => (
						<li key={location.id} className="space-y-1 py-3 first:pt-0 last:pb-0">
							<div className="flex items-start justify-between gap-3">
								<div className="min-w-0">
									<p className="truncate text-[13px] font-medium">{placeOf(location.router)}</p>
									<p className="text-[11px] text-muted-foreground">
										{location.router?.code ? `${location.router.code} · ` : ""}
										{location.lastSyncedAt ? `Synced ${formatRelative(location.lastSyncedAt)}` : "Never synced"}
									</p>
								</div>
								<StatusBadge status={location.status} />
							</div>
							{location.lastError && <p className="text-[12px] text-destructive">{location.lastError}</p>}
							{location.subscriptionId && (
								<Link href={`/admin/subscriptions/${location.subscriptionId}`} className="text-[12px] text-signal hover:underline">
									View subscription →
								</Link>
							)}
						</li>
					))}
				</ul>
				<SimplePagination page={page} totalPages={data.meta?.totalPages ?? 1} onChange={setPage} className="mt-4" />
			</div>
		);
	}

	return (
		<SectionCard title="Locations" description="Every router this account has been provisioned on.">
			{renderBody()}
		</SectionCard>
	);
}
"use client";

import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouters } from "@/features/routers/hooks/use-routers";
import { formatNumber } from "@/lib/format";

interface RouterAudiencePickerProps {
	selectedIds: string[];
	onChange: (ids: string[]) => void;
}

export function RouterAudiencePicker({ selectedIds, onChange }: RouterAudiencePickerProps) {
	const { data, isLoading, isError } = useRouters({ limit: 100 });

	if (isLoading) return <Skeleton className="h-32 rounded-lg" />;
	if (isError || !data) return <p className="text-sm text-destructive">We couldn&apos;t load routers.</p>;

	const routers = data.items;
	const notOnline = routers.filter((r) => r.status !== "online");
	const selected = new Set(selectedIds);

	function toggle(id: string, checked: boolean) {
		onChange(checked ? [...selectedIds, id] : selectedIds.filter((x) => x !== id));
	}

	return (
		<div className="space-y-2">
			<div className="flex flex-wrap items-center justify-between gap-2">
				<p className="text-[12px] text-muted-foreground">{selectedIds.length} selected</p>
				<div className="flex gap-2">
					{notOnline.length > 0 && (
						<Button type="button" variant="outline" size="sm" className="bg-surface-2" onClick={() => onChange(notOnline.map((r) => r.id))}>
							Select all offline ({notOnline.length})
						</Button>
					)}
					{selectedIds.length > 0 && (
						<Button type="button" variant="ghost" size="sm" onClick={() => onChange([])}>
							Clear
						</Button>
					)}
				</div>
			</div>

			<ul className="max-h-60 divide-y overflow-y-auto rounded-lg border">
				{routers.map((router) => (
					<li key={router.id}>
						<label className="flex cursor-pointer items-center gap-3 p-3 hover:bg-muted/50">
							<Checkbox checked={selected.has(router.id)} onCheckedChange={(checked) => toggle(router.id, checked === true)} />
							<span className="min-w-0 flex-1">
								<span className="block truncate text-[13px] font-medium">{router.name}</span>
								<span className="block truncate text-[11px] text-muted-foreground">
									{[router.location, router.code].filter(Boolean).join(" · ")}
								</span>
							</span>
							<span className="text-mono hidden text-[11px] text-muted-foreground sm:inline">{formatNumber(router.currentSessions ?? 0)} online</span>
							<StatusBadge status={router.status ?? "offline"} />
						</label>
					</li>
				))}
			</ul>
		</div>
	);
}
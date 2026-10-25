"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2, WifiOff } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Can } from "@/components/shared/can";
import { SectionCard } from "@/components/shared/section-card";
import { StatusMessage } from "@/components/shared/status-message";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { settleFailure } from "@/lib/api/failure";
import { NETWORK_ERROR_CODES } from "../constants";
import { useHotspotProfiles, useProfileActions } from "../hooks/use-network";
import type { HotspotProfile } from "../types/network.types";
import { ProfileFormDialog } from "./profile-form-dialog";

export function ProfilesTab() {
	const profiles = useHotspotProfiles();
	const { remove } = useProfileActions();
	const [editing, setEditing] = useState<HotspotProfile | "new" | null>(null);
	const [deleting, setDeleting] = useState<HotspotProfile | null>(null);

	if (profiles.isLoading) return <Skeleton className="h-64 rounded-xl" />;

	if (profiles.isError || !profiles.data) {
		return (
			<StatusMessage icon={WifiOff} tone="warning" title="We couldn't load profiles" text="Check your connection and try again.">
				<Button size="lg" className="w-full" onClick={() => profiles.refetch()}>
					Try again
				</Button>
			</StatusMessage>
		);
	}

	return (
		<SectionCard
			title="Speed profiles"
			description="Each profile sets upload and download speed on every router."
			actions={
				<Can permission="network:manage">
					<Button size="sm" onClick={() => setEditing("new")}>
						<Plus />
						New profile
					</Button>
				</Can>
			}
		>
			{profiles.data.length === 0 ? (
				<div className="space-y-2 py-6 text-center">
					<p className="text-sm font-medium">No managed profiles yet</p>
					<p className="mx-auto max-w-sm text-[12px] text-muted-foreground">
						Use Import on this page to bring in the profiles already on your routers, or create one here.
					</p>
				</div>
			) : (
				<ul className="divide-y">
					{profiles.data.map((profile) => {
						const inUse = profile.usedByPlans.length > 0;

						return (
							<li key={profile.id} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
								<div className="min-w-0 space-y-1">
									<p className="truncate text-sm font-medium">{profile.name}</p>
									<p className="text-mono text-[12px] text-muted-foreground">
										{profile.rateLimit} · up {profile.uploadMbps} / down {profile.downloadMbps} Mbps · {profile.sharedUsers} {profile.sharedUsers === 1 ? "device" : "devices"}
									</p>
									<p className="text-[12px] text-muted-foreground">
										{inUse ? `Used by ${profile.usedByPlans.map((p) => p.name).join(", ")}` : "Not used by any plan"}
									</p>
								</div>
								<Can permission="network:manage">
									<div className="flex shrink-0 gap-2">
										<Button variant="outline" size="sm" className="bg-surface-2" onClick={() => setEditing(profile)}>
											<Pencil />
											Edit
										</Button>
										<Button
											variant="outline"
											size="sm"
											className="bg-surface-2 text-destructive"
											disabled={inUse}
											title={inUse ? "Move its plans to another profile first" : undefined}
											onClick={() => setDeleting(profile)}
										>
											<Trash2 />
											Delete
										</Button>
									</div>
								</Can>
							</li>
						);
					})}
				</ul>
			)}

			{editing && <ProfileFormDialog profile={editing === "new" ? undefined : editing} onClose={() => setEditing(null)} />}

			{deleting && (
				<ConfirmDialog
					open
					destructive
					onOpenChange={(open) => !open && setDeleting(null)}
					title={`Delete ${deleting.name}?`}
					description="It will be removed from every router in the background. A router that still has users on it keeps it until they leave."
					confirmLabel="Delete profile"
					onConfirm={async () => {
						const res = await remove.mutateAsync(deleting.id);
						if (!res.success) {
							if (res.code === NETWORK_ERROR_CODES.HOTSPOT_PROFILE_IN_USE) {
								toast.error(res.message);
								return false;
							}
							return settleFailure(res, "The delete");
						}
						toast.success("Profile deleted");
					}}
				/>
			)}
		</SectionCard>
	);
}

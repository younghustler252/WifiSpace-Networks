"use client";

import { useState } from "react";
import { Download, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Can } from "@/components/shared/can";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { settleFailure } from "@/lib/api/failure";
import { useSyncActions } from "../hooks/use-network";
import { ImportDialog } from "./import-dialog";
import { ProfilesTab } from "./profiles-tab";
import { StatusTab } from "./status-tab";
import { WalledGardenTab } from "./walled-garden-tab";

export function NetworkAdmin() {
	const { all } = useSyncActions();
	const [importing, setImporting] = useState(false);

	async function syncAll() {
		const res = await all.mutateAsync();
		if (!res.success) {
			settleFailure(res, "The sync");
			return;
		}
		toast.success(`Sync queued for ${res.data.queued} router${res.data.queued === 1 ? "" : "s"}`);
	}

	return (
		<div className="space-y-6">
			<PageHeader
				title="Network config"
				description="Speed profiles and walled garden, pushed to every router."
				actions={
					<Can permission="network:manage">
						<div className="flex gap-2">
							<Button variant="outline" className="bg-surface-2" onClick={() => setImporting(true)}>
								<Download />
								Import
							</Button>
							<Button disabled={all.isPending} onClick={syncAll}>
								{all.isPending ? <Loader2 className="animate-spin" /> : <RefreshCw />}
								Sync all
							</Button>
						</div>
					</Can>
				}
			/>

			<Tabs defaultValue="status" className="space-y-4">
				<TabsList className="h-11 w-full sm:w-auto">
					<TabsTrigger value="status" className="min-h-9 flex-1 sm:flex-none">
						Sync status
					</TabsTrigger>
					<TabsTrigger value="profiles" className="min-h-9 flex-1 sm:flex-none">
						Speed profiles
					</TabsTrigger>
					<TabsTrigger value="walled-garden" className="min-h-9 flex-1 sm:flex-none">
						Walled garden
					</TabsTrigger>
				</TabsList>
				<TabsContent value="status">
					<StatusTab />
				</TabsContent>
				<TabsContent value="profiles">
					<ProfilesTab />
				</TabsContent>
				<TabsContent value="walled-garden">
					<WalledGardenTab />
				</TabsContent>
			</Tabs>

			{importing && <ImportDialog onClose={() => setImporting(false)} />}
		</div>
	);
}

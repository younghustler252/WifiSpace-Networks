"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Field } from "@/components/shared/field";
import { Notice } from "@/components/shared/notice";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouters } from "@/features/routers/hooks/use-routers";
import { describeRouterProblem, routerStatusLabel } from "@/features/routers/lib/router-health";
import { toastWithProvisioning } from "@/features/subscriptions/lib/provisioning";
import { isAmbiguousFailure, settleFailure } from "@/lib/api/failure";
import { useAdminAccountActions } from "../hooks/use-accounts";
import type { AdminAccount } from "../types/accounts.types";

export function MoveRouterDialog({ account, onClose }: { account: AdminAccount; onClose: () => void }) {
	const { update } = useAdminAccountActions();
	const routers = useRouters({ limit: 100 });
	const [routerId, setRouterId] = useState("");
	const [failure, setFailure] = useState<{ code: string; message: string } | null>(null);
	const ipoe = account.accessMethod === "ipoe";

	const options = (routers.data?.items ?? [])
		.filter((r) => r.id !== account.routerId && r.isEnabled !== false)
		.sort((a, b) => Number((b.supportedServices ?? []).includes("pppoe")) - Number((a.supportedServices ?? []).includes("pppoe")) || Number(!!b.isDefaultRouter) - Number(!!a.isDefaultRouter));
	const current = (routers.data?.items ?? []).find((r) => r.id === account.routerId);
	const target = options.find((r) => r.id === routerId);
	const issue = target ? describeRouterProblem(target) : null;

	async function submit() {
		if (!routerId) return;
		setFailure(null);

		const res = await update.mutateAsync({ id: account.id, body: { routerId } });

		if (!res.success) {
			if (isAmbiguousFailure(res)) {
				settleFailure(res, "The move");
				onClose();
				return;
			}
			setFailure({ code: res.code, message: res.message });
			return;
		}

		toastWithProvisioning("Customer moved to the new router", res.data);
		onClose();
	}

	return (
		<Dialog open onOpenChange={(open) => !open && !update.isPending && onClose()}>
			<DialogContent className="max-h-[90svh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Move to another router</DialogTitle>
					<DialogDescription>
						{account.wsnId} is on {current ? `${current.name} (${current.code})` : "its current router"}.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-5">
					<Field label="New router" htmlFor="move-router">
						{routers.isLoading ? (
							<Skeleton className="h-11 rounded-lg" />
						) : (
							<Select value={routerId || undefined} onValueChange={(v) => { setRouterId(v); setFailure(null); }}>
								<SelectTrigger id="move-router" className="w-full">
									<SelectValue placeholder="Choose a router" />
								</SelectTrigger>
								<SelectContent>
									{options.map((router) => (
										<SelectItem key={router.id} value={router.id}>
											{router.name} · {router.code}
											{router.isDefaultRouter ? " (default)" : ""}
											{router.status && router.status !== "online" ? ` · ${routerStatusLabel(router) ?? router.status}` : ""}
											{(router.supportedServices ?? []).includes("pppoe") ? "" : " · not set for home internet"}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						)}
					</Field>

					<Notice
						tone="warning"
						title="This moves the customer's router entry"
						text={
							ipoe
								? "The customer's MAC is removed from the old router and added to the new one. They may lose connection briefly, and their own router must be plugged into the new location."
								: "The router login is removed from the old router and created on the new one. They may lose connection briefly."
						}
					/>

					{issue && <Notice tone={issue.tone} title={`${target?.name}: ${issue.title}`} text="The move is queued and retried automatically once the router's API is reachable." />}

					{failure && <Notice tone="danger" title="The move didn't go through" text={`${failure.message} (${failure.code})`} />}

					<Button size="lg" className="w-full" disabled={!routerId || update.isPending} onClick={submit}>
						{update.isPending && <Loader2 className="animate-spin" />}
						Move customer
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}

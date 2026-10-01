"use client";

import { useState } from "react";
import { CheckCircle2, WifiOff } from "lucide-react";
import { InfoTile } from "@/components/shared/info-tile";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { StatusMessage } from "@/components/shared/status-message";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/format";
import { useAdminAccounts } from "../hooks/use-accounts";
import type { AdminAccount } from "../types/accounts.types";
import type { AccountAction } from "./account-actions-menu";
import { AccountActionDialog } from "./account-dialogs";
import { ownerName, useAccountOwner } from "./owner-cell";

interface RequestCardProps {
	account: AdminAccount;
	onAction: (action: AccountAction) => void;
}

function RequestCard({ account, onAction }: RequestCardProps) {
	const { owner, isLoading } = useAccountOwner(account);

	return (
		<SectionCard
			title={account.wsnId}
			description={`Requested ${formatDate(account.createdAt)}`}
			actions={<StatusBadge status="pending" />}
		>
			<div className="space-y-4">
				<div className="grid gap-3 sm:grid-cols-2">
					<InfoTile label="Customer" value={isLoading ? "Loading…" : ownerName(owner) || "—"} mono={false} />
					<InfoTile label="Type" value={<span className="capitalize">{account.accountType}</span>} mono={false} />
					<InfoTile label="Phone" value={owner?.phone || "—"} />
					<InfoTile label="Email" value={owner?.email || "—"} mono={false} />
					<InfoTile label="Address" value={owner?.address || "—"} mono={false} className="sm:col-span-2" />
				</div>
				<div className="flex flex-wrap gap-3">
					<Button onClick={() => onAction("approve")}>Approve…</Button>
					<Button variant="outline" className="bg-surface-2" onClick={() => onAction("reject")}>
						Reject…
					</Button>
				</div>
			</div>
		</SectionCard>
	);
}

export function ApprovalQueue() {
	const [dialog, setDialog] = useState<{ action: AccountAction; account: AdminAccount } | null>(null);
	const { data, isLoading, isError, refetch } = useAdminAccounts({
		approvalStatus: "pending",
		serviceType: "pppoe",
		limit: 50,
	});

	function renderBody() {
		if (isLoading) {
			return (
				<div className="grid gap-4 lg:grid-cols-2">
					<Skeleton className="h-64 rounded-xl" />
					<Skeleton className="h-64 rounded-xl" />
				</div>
			);
		}

		if (isError || !data) {
			return (
				<StatusMessage icon={WifiOff} tone="warning" title="We couldn't load the queue" text="Check your connection and try again.">
					<Button size="lg" className="w-full" onClick={() => refetch()}>
						Try again
					</Button>
				</StatusMessage>
			);
		}

		if (data.items.length === 0) {
			return (
				<StatusMessage icon={CheckCircle2} tone="success" title="All caught up" text="No installation requests are waiting for review." />
			);
		}

		return (
			<div className="grid gap-4 lg:grid-cols-2">
				{data.items.map((account) => (
					<RequestCard key={account.id} account={account} onAction={(action) => setDialog({ action, account })} />
				))}
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<PageHeader
				title="Approvals"
				description={
					data?.meta ? `${data.meta.total} installation request${data.meta.total === 1 ? "" : "s"} waiting for review.` : "Home internet installation requests."
				}
			/>
			{renderBody()}
			{dialog && <AccountActionDialog action={dialog.action} account={dialog.account} onClose={() => setDialog(null)} />}
		</div>
	);
}
"use client";

import { useEffect, useState } from "react";
import { Network, Plus, Search, WifiOff } from "lucide-react";
import { FILTER_ALL as ALL, FilterSelect } from "@/components/shared/filter-select";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { SimplePagination } from "@/components/shared/simple-pagination";
import { StatusMessage } from "@/components/shared/status-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { ACCOUNT_STATUS_OPTIONS, APPROVAL_OPTIONS, SERVICE_TYPE_OPTIONS } from "../constants";
import { useAdminAccounts } from "../hooks/use-accounts";
import type { AdminAccount } from "../types/accounts.types";
import type { AccountAction } from "./account-actions-menu";
import { AccountActionDialog } from "./account-dialogs";
import { AdminAccountsTable } from "./admin-accounts-table";
import { AdminCreateAccountDialog } from "./admin-create-account-dialog";

export function AccountsAdmin() {
	const [search, setSearch] = useState("");
	const [serviceType, setServiceType] = useState(ALL);
	const [status, setStatus] = useState(ALL);
	const [approval, setApproval] = useState(ALL);
	const [page, setPage] = useState(1);
	const [creating, setCreating] = useState(false);
	const [dialog, setDialog] = useState<{ action: AccountAction; account: AdminAccount } | null>(null);
	const debouncedSearch = useDebouncedValue(search, 350);

	useEffect(() => {
		setPage(1);
	}, [debouncedSearch, serviceType, status, approval]);

	const { data, isLoading, isError, isPlaceholderData, refetch } = useAdminAccounts({
		search: debouncedSearch.trim() || undefined,
		serviceType: serviceType === ALL ? undefined : serviceType,
		status: status === ALL ? undefined : status,
		approvalStatus: approval === ALL ? undefined : approval,
		page,
	});

	const filtered = !!debouncedSearch.trim() || serviceType !== ALL || status !== ALL || approval !== ALL;

	function clearFilters() {
		setSearch("");
		setServiceType(ALL);
		setStatus(ALL);
		setApproval(ALL);
	}

	function renderBody() {
		if (isLoading) return <Skeleton className="h-96 rounded-xl" />;

		if (isError || !data) {
			return (
				<StatusMessage icon={WifiOff} tone="warning" title="We couldn't load accounts" text="Check your connection and try again.">
					<Button size="lg" className="w-full" onClick={() => refetch()}>
						Try again
					</Button>
				</StatusMessage>
			);
		}

		if (data.items.length === 0) {
			return (
				<StatusMessage
					icon={Network}
					title="No accounts found"
					text={filtered ? "Try a different search or clear the filters." : "No accounts have been created yet."}
				>
					{filtered && (
						<Button size="lg" variant="outline" className="w-full bg-surface-2" onClick={clearFilters}>
							Clear filters
						</Button>
					)}
				</StatusMessage>
			);
		}

		return (
			<div className={isPlaceholderData ? "opacity-60 transition-opacity" : undefined}>
				<SectionCard
					title="All accounts"
					description={data.meta ? `${data.meta.total} account${data.meta.total === 1 ? "" : "s"}` : undefined}
				>
					<AdminAccountsTable items={data.items} onAction={(action, account) => setDialog({ action, account })} />
				</SectionCard>
				<SimplePagination page={page} totalPages={data.meta?.totalPages ?? 1} onChange={setPage} className="mt-4" />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<PageHeader
				title="Accounts"
				description="PPPoE lines and hotspot identities across all customers."
				actions={
					<Button onClick={() => setCreating(true)}>
						<Plus />
						Create account
					</Button>
				}
			/>

			<div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
				<div className="relative min-w-52 flex-1">
					<Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Search account ID"
						aria-label="Search accounts"
						className="pl-9"
					/>
				</div>
				<FilterSelect value={serviceType} onChange={setServiceType} label="Service" allLabel="All services" options={SERVICE_TYPE_OPTIONS} />
				<FilterSelect value={status} onChange={setStatus} label="Status" allLabel="All statuses" options={ACCOUNT_STATUS_OPTIONS} />
				<FilterSelect value={approval} onChange={setApproval} label="Approval" allLabel="All approvals" options={APPROVAL_OPTIONS} />
			</div>

			{renderBody()}

			{dialog && <AccountActionDialog action={dialog.action} account={dialog.account} onClose={() => setDialog(null)} />}

			{creating && <AdminCreateAccountDialog onClose={() => setCreating(false)} />}
		</div>
	);
}

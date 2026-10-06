"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Users, WifiOff } from "lucide-react";
import { FILTER_ALL as ALL, FilterSelect } from "@/components/shared/filter-select";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { SimplePagination } from "@/components/shared/simple-pagination";
import { StatusMessage } from "@/components/shared/status-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useAuthStore } from "@/stores/auth.store";
import { useAdminUsers } from "../hooks/use-users";
import { ROLE_OPTIONS, USER_SORT_OPTIONS, USER_STATUS_OPTIONS } from "../schemas/users.schemas";
import { useUserActionHost } from "./user-action-host";
import { UserFormDialog } from "./user-form-dialog";
import { UsersTable } from "./users-table";

export function UsersAdmin() {
	const selfId = useAuthStore((s) => s.user?.id);
	const host = useUserActionHost();

	const [search, setSearch] = useState("");
	const [role, setRole] = useState(ALL);
	const [status, setStatus] = useState(ALL);
	const [sort, setSort] = useState("newest");
	const [page, setPage] = useState(1);
	const [creating, setCreating] = useState(false);
	const debouncedSearch = useDebouncedValue(search, 350);

	useEffect(() => {
		setPage(1);
	}, [debouncedSearch, role, status, sort]);

	const { data, isLoading, isError, isPlaceholderData, refetch } = useAdminUsers({
		search: debouncedSearch.trim() || undefined,
		role: role === ALL ? undefined : role,
		status: status === ALL ? undefined : status,
		sort,
		page,
	});

	const filtered = !!debouncedSearch.trim() || role !== ALL || status !== ALL;

	function clearFilters() {
		setSearch("");
		setRole(ALL);
		setStatus(ALL);
	}

	function renderBody() {
		if (isLoading) return <Skeleton className="h-96 rounded-xl" />;

		if (isError || !data) {
			return (
				<StatusMessage icon={WifiOff} tone="warning" title="We couldn't load users" text="Check your connection and try again.">
					<Button size="lg" className="w-full" onClick={() => refetch()}>
						Try again
					</Button>
				</StatusMessage>
			);
		}

		if (data.items.length === 0) {
			return (
				<StatusMessage
					icon={Users}
					title="No users found"
					text={filtered ? "Try a different search or clear the filters." : "No one has signed up yet."}
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
					title="All users"
					description={data.meta ? `${data.meta.total} user${data.meta.total === 1 ? "" : "s"}` : undefined}
				>
					<UsersTable items={data.items} selfId={selfId} onAction={host.handle} />
				</SectionCard>
				<SimplePagination page={page} totalPages={data.meta?.totalPages ?? 1} onChange={setPage} className="mt-4" />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<PageHeader
				title="Users"
				description="Everyone with a WifiSpace login: customers, staff and superadmins."
				actions={
					<Button onClick={() => setCreating(true)}>
						<Plus />
						Add user
					</Button>
				}
			/>

			<div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
				<div className="relative min-w-52 flex-1">
					<Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Search name or email"
						aria-label="Search users"
						className="pl-9"
					/>
				</div>
				<FilterSelect value={role} onChange={setRole} label="Role" allLabel="All roles" options={ROLE_OPTIONS} />
				<FilterSelect value={status} onChange={setStatus} label="Status" allLabel="All statuses" options={USER_STATUS_OPTIONS} />
				<FilterSelect value={sort} onChange={setSort} label="Sort" options={USER_SORT_OPTIONS} />
			</div>

			{renderBody()}

			{creating && <UserFormDialog onClose={() => setCreating(false)} />}
			{host.element}
		</div>
	);
}
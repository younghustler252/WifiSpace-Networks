"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useAdminUsers } from "../hooks/use-users";
import type { UserProfile } from "../types/users.types";

interface UserPickerProps {
	selected: UserProfile[];
	onChange: (users: UserProfile[]) => void;
}

export function UserPicker({ selected, onChange }: UserPickerProps) {
	const [search, setSearch] = useState("");
	const term = useDebouncedValue(search.trim(), 300);
	const { data, isLoading } = useAdminUsers({ search: term || undefined, status: "active" });

	const selectedIds = new Set(selected.map((u) => u.id));
	const results = (data?.items ?? []).filter((u) => !selectedIds.has(u.id));

	function renderResults() {
		if (isLoading) return <Skeleton className="h-16 rounded-lg" />;
		if (results.length === 0) return <p className="text-[13px] text-muted-foreground">No more users match.</p>;

		return (
			<ul className="max-h-48 divide-y overflow-y-auto rounded-lg border">
				{results.map((user) => (
					<li key={user.id}>
						<button
							type="button"
							onClick={() => onChange([...selected, user])}
							className="flex w-full flex-col p-3 text-left hover:bg-muted/50"
						>
							<span className="text-[13px] font-medium">
								{user.firstName} {user.lastName}
							</span>
							<span className="text-[11px] text-muted-foreground">{user.email}</span>
						</button>
					</li>
				))}
			</ul>
		);
	}

	return (
		<div className="space-y-3">
			{selected.length > 0 && (
				<ul className="flex flex-wrap gap-2">
					{selected.map((user) => (
						<li
							key={user.id}
							className="inline-flex items-center gap-1 rounded-full border bg-surface-2 py-1 pl-2.5 pr-1 text-[12px]"
						>
							{user.firstName} {user.lastName}
							<button
								type="button"
								aria-label={`Remove ${user.firstName} ${user.lastName}`}
								onClick={() => onChange(selected.filter((u) => u.id !== user.id))}
								className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
							>
								<X className="size-3" />
							</button>
						</li>
					))}
				</ul>
			)}

			<div className="relative">
				<Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					placeholder="Search by name or email"
					aria-label="Search users"
					className="pl-9"
				/>
			</div>
			{renderResults()}
		</div>
	);
}
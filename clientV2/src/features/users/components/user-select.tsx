"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useAdminUsers } from "../hooks/use-users";
import type { UserProfile } from "../types/users.types";

interface UserSelectProps {
	value: UserProfile | null;
	onChange: (user: UserProfile | null) => void;
}

export function UserSelect({ value, onChange }: UserSelectProps) {
	const [search, setSearch] = useState("");
	const term = useDebouncedValue(search.trim(), 300);
	const { data, isLoading } = useAdminUsers({ search: term || undefined, status: "active" });

	if (value) {
		return (
			<div className="card-elevated flex items-center justify-between gap-3 bg-surface-2 p-3">
				<div className="min-w-0">
					<p className="truncate text-[13px] font-medium">
						{value.firstName} {value.lastName}
					</p>
					<p className="truncate text-[11px] text-muted-foreground">{value.email}</p>
				</div>
				<Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)}>
					Change
				</Button>
			</div>
		);
	}

	function renderResults() {
		if (term.length < 2) return null;
		if (isLoading) return <Skeleton className="h-16 rounded-lg" />;
		const items = data?.items ?? [];
		if (items.length === 0) return <p className="text-[13px] text-muted-foreground">No users found.</p>;

		return (
			<ul className="max-h-48 divide-y overflow-y-auto rounded-lg border">
				{items.map((user) => (
					<li key={user.id}>
						<button type="button" onClick={() => onChange(user)} className="flex w-full flex-col p-3 text-left hover:bg-muted/50">
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
		<div className="space-y-2">
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
"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useAdminAccounts } from "../hooks/use-accounts";
import { getAccountTitle } from "../lib/account-meta";
import type { AdminAccount } from "../types/accounts.types";
import { OwnerCell } from "./owner-cell";

interface AccountPickerProps {
	value: AdminAccount | null;
	onChange: (account: AdminAccount | null) => void;
}

export function AccountPicker({ value, onChange }: AccountPickerProps) {
	const [search, setSearch] = useState("");
	const term = useDebouncedValue(search.trim(), 300);
	const enabled = term.length >= 2;
	const { data, isLoading } = useAdminAccounts({ search: term || undefined, approvalStatus: "approved", limit: 6 }, enabled);

	if (value) {
		return (
			<div className="card-elevated flex items-center justify-between gap-3 bg-surface-2 p-3">
				<div className="min-w-0 space-y-1">
					<OwnerCell account={value} />
					<p className="text-[11px] text-muted-foreground">
						<span className="text-mono">{value.wsnId}</span> · {getAccountTitle(value)}
					</p>
				</div>
				<Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)}>
					Change
				</Button>
			</div>
		);
	}

	function renderResults() {
		if (!enabled) return null;
		if (isLoading) return <Skeleton className="h-16 rounded-lg" />;
		if (!data || data.items.length === 0) return <p className="text-[13px] text-muted-foreground">No accounts found.</p>;

		return (
			<ul className="max-h-56 divide-y overflow-y-auto rounded-lg border">
				{data.items.map((account) => (
					<li key={account.id}>
						<button
							type="button"
							onClick={() => onChange(account)}
							className="flex w-full items-center justify-between gap-3 p-3 text-left hover:bg-muted/50"
						>
							<OwnerCell account={account} />
							<span className="text-mono shrink-0 text-[11px] text-muted-foreground">{account.wsnId}</span>
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
					placeholder="Search by account ID, name or email"
					aria-label="Search accounts"
					className="pl-9"
				/>
			</div>
			{renderResults()}
		</div>
	);
}
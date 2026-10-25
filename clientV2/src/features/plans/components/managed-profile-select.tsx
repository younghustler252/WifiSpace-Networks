"use client";

import Link from "next/link";
import { Field } from "@/components/shared/field";
import { Can } from "@/components/shared/can";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useHotspotProfiles } from "@/features/network/hooks/use-network";

const NONE = "__none__";

interface ManagedProfileSelectProps {
	id: string;
	label: string;
	value: string;
	onChange: (value: string) => void;
	hint?: string;
	error?: string;
	allowDefault?: boolean;
	optional?: boolean;
}

export function useManagedProfiles() {
	const profiles = useHotspotProfiles();
	return { loading: profiles.isLoading, names: (profiles.data ?? []).map((p) => ({ name: p.name, rateLimit: p.rateLimit })), hasAny: (profiles.data?.length ?? 0) > 0 };
}

export function ManagedProfileSelect({ id, label, value, onChange, hint, error, allowDefault, optional }: ManagedProfileSelectProps) {
	const { loading, names } = useManagedProfiles();

	if (loading) return <Skeleton className="h-11 w-full rounded-lg" />;

	const options = names.map((p) => ({ value: p.name, label: `${p.name} · ${p.rateLimit}` }));
	if (allowDefault && !names.some((p) => p.name === "default")) options.unshift({ value: "default", label: "default" });
	if (value && value !== "default" && !options.some((o) => o.value === value)) options.push({ value, label: `${value} (not managed)` });

	return (
		<Field label={label} htmlFor={id} error={error} hint={hint}>
			<Select value={value || (optional ? NONE : "")} onValueChange={(v) => onChange(v === NONE ? "" : v)}>
				<SelectTrigger id={id} className="w-full" aria-invalid={!!error}>
					<SelectValue placeholder="Choose a profile" />
				</SelectTrigger>
				<SelectContent>
					{optional && <SelectItem value={NONE}>None</SelectItem>}
					{options.map((o) => (
						<SelectItem key={o.value} value={o.value}>
							{o.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			<Can permission="network:manage">
				<Link href="/admin/network" className="mt-1 inline-flex min-h-9 items-center text-[12px] font-medium text-signal">
					Create a profile
				</Link>
			</Can>
		</Field>
	);
}

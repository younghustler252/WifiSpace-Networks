"use client";

import { useEffect, useMemo, useState } from "react";
import { Field } from "@/components/shared/field";
import { Notice } from "@/components/shared/notice";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouterProfiles, useRouters } from "../hooks/use-routers";

interface ProfilePickerProps {
	value: string;
	onChange: (value: string) => void;
	serviceType: string;
	error?: string;
}

export function ProfilePicker({ value, onChange, serviceType, error }: ProfilePickerProps) {
	const routers = useRouters({ limit: 100 });
	const [routerId, setRouterId] = useState("");
	const [manual, setManual] = useState(false);

	const candidates = useMemo(
		() =>
			(routers.data?.items ?? [])
				.filter((r) => r.isEnabled !== false && (r.supportedServices ?? []).includes(serviceType))
				.sort((a, b) => Number(!!b.isDefaultRouter) - Number(!!a.isDefaultRouter)),
		[routers.data, serviceType]
	);

	useEffect(() => {
		if (candidates.length > 0 && !candidates.some((r) => r.id === routerId)) setRouterId(candidates[0].id);
	}, [candidates, routerId]);

	const profiles = useRouterProfiles(routerId || undefined, serviceType);
	const currentRouter = candidates.find((r) => r.id === routerId);
	const profileNames = profiles.data ?? [];
	const missing = !!value && !!profiles.data && !profileNames.includes(value);
	const unavailable = routers.isError || (!routers.isLoading && candidates.length === 0) || profiles.isError;

	if (manual || unavailable) {
		return (
			<Field
				label="MikroTik profile"
				htmlFor="plan-profile"
				error={error}
				hint={
					unavailable
						? "We couldn't load profiles from a router, so type the exact profile name."
						: "Type the exact profile name from the router."
				}
			>
				<Input id="plan-profile" autoComplete="off" value={value} aria-invalid={!!error} onChange={(e) => onChange(e.target.value)} />
				{!unavailable && (
					<button type="button" onClick={() => setManual(false)} className="mt-1 text-[12px] text-signal hover:underline">
						Pick from a router instead
					</button>
				)}
			</Field>
		);
	}

	if (routers.isLoading) return <Skeleton className="h-24 rounded-lg" />;

	return (
		<div className="space-y-3">
			<Field label="Read profiles from" htmlFor="plan-profile-router">
				<Select value={routerId} onValueChange={setRouterId}>
					<SelectTrigger id="plan-profile-router" className="w-full">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{candidates.map((router) => (
							<SelectItem key={router.id} value={router.id}>
								{router.name}
								{router.isDefaultRouter ? " (default)" : ""}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</Field>

			<Field
				label="MikroTik profile"
				htmlFor="plan-profile"
				error={error}
				hint="Make sure the same profile exists on every router that sells this plan."
			>
				{profiles.isLoading ? (
					<Skeleton className="h-11 rounded-lg" />
				) : (
					<Select value={value || undefined} onValueChange={onChange}>
						<SelectTrigger id="plan-profile" className="w-full" aria-invalid={!!error}>
							<SelectValue placeholder="Choose a profile" />
						</SelectTrigger>
						<SelectContent>
							{missing && <SelectItem value={value}>{value} (not on this router)</SelectItem>}
							{profileNames.map((name) => (
								<SelectItem key={name} value={name}>
									{name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				)}
			</Field>

			{missing && (
				<Notice
					tone="warning"
					title="This profile wasn't found"
					text={`"${value}" doesn't exist on ${currentRouter?.name ?? "this router"}. Customers on this plan won't get the right speed unless it exists.`}
				/>
			)}

			<button type="button" onClick={() => setManual(true)} className="text-[12px] text-muted-foreground hover:text-foreground">
				Type a profile name instead
			</button>
		</div>
	);
}
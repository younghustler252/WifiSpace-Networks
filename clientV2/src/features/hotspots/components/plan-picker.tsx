"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Loader2, MapPin } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Field } from "@/components/shared/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { PlanCard } from "@/features/plans/components/plan-card";
import type { Plan } from "@/features/plans/types/plans.types";
import { getPlanPricing } from "@/features/plans/lib/pricing";
import { durationInDays, formatCurrency } from "@/lib/format";
import { useHotspotPlans } from "../hooks/use-hotspots";
import { readRememberedEmail, rememberEmail } from "../lib/remembered-email";
import { hotspotsApi } from "../services/hotspots.api";
import type { HotspotClientInfo, HotspotRouter } from "../types/hotspots.types";
import { getBestValueId } from "@/features/plans/lib/best-value";

const emailSchema = z.string().trim().email();

interface PlanPickerProps {
	client: HotspotClientInfo;
	router: HotspotRouter;
	isNewDevice: boolean;
	onLogin: () => void;
	onExistingUser: (email: string) => void;
}


function buildCallbackUrl() {
	const url = new URL(window.location.href);
	url.searchParams.delete("reference");
	url.searchParams.delete("trxref");
	return url.toString();
}

export function PlanPicker({ client, router, isNewDevice, onLogin, onExistingUser }: PlanPickerProps) {
	const { data: plans, isLoading, isError, refetch } = useHotspotPlans();
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [email, setEmail] = useState("");
	const [firstName, setFirstName] = useState("");
	const [emailError, setEmailError] = useState<string | null>(null);
	const [redirecting, setRedirecting] = useState(false);
	const start = useMutation({ mutationFn: hotspotsApi.start });

	useEffect(() => {
		const saved = readRememberedEmail();
		if (saved) setEmail(saved);
	}, []);

	const selected = plans?.find((p) => p.id === selectedId) ?? null;
	const bestValueId = useMemo(() => getBestValueId(plans ?? []), [plans]);
	const busy = start.isPending || redirecting;
	const hasPlans = !!plans && plans.length > 0;

	async function handlePay() {
		if (!selected || busy) return;

		const parsed = emailSchema.safeParse(email);
		if (!parsed.success) {
			setEmailError("Enter a valid email so we can send your receipt");
			return;
		}

		const res = await start.mutateAsync({
			...client,
			email: parsed.data,
			firstName: isNewDevice && firstName.trim() ? firstName.trim() : undefined,
			planId: selected.id,
			callbackUrl: buildCallbackUrl(),
		});

		if (!res.success) {
			toast.error(res.message);
			return;
		}

		if (res.data.status === "EXISTING_USER") {
			toast.info(res.data.message);
			onExistingUser(parsed.data);
			return;
		}

		rememberEmail(parsed.data);
		setRedirecting(true);
		window.location.assign(res.data.authorizationUrl);
	}

	return (
		<div className="space-y-5">
			<div className="space-y-2">
				<p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
					<MapPin className="size-3.5" />
					{router.location || router.name}
				</p>
				<h1 className="text-2xl font-semibold tracking-tight">Choose your plan</h1>
				<p className="text-sm text-muted-foreground">Pay once and get online instantly. No sign-up needed.</p>
			</div>

			{isLoading && (
				<div className="space-y-3 pt-1">
					{[0, 1, 2].map((i) => (
						<Skeleton key={i} className="h-28 rounded-2xl" />
					))}
				</div>
			)}

			{isError && (
				<div className="card-elevated space-y-3 bg-surface-2 p-4 text-center text-sm">
					<p>We couldn&apos;t load the plans.</p>
					<Button variant="outline" onClick={() => refetch()}>
						Try again
					</Button>
				</div>
			)}

			{plans && plans.length === 0 && (
				<p className="card-elevated bg-surface-2 p-4 text-center text-sm text-muted-foreground">
					No plans are available right now. Please try again shortly.
				</p>
			)}

			{hasPlans && (
				<div role="radiogroup" aria-label="Plans" className="space-y-3 pt-1">
					{plans.map((plan) => (
						<PlanCard
							key={plan.id}
							plan={plan}
							selected={plan.id === selectedId}
							highlight={plan.id === bestValueId ? "Best value" : undefined}
							onSelect={(p) => setSelectedId(p.id)}
						/>
					))}
				</div>
			)}

			{hasPlans && (
				<div className="space-y-4">
					<Field label="Email for your receipt" htmlFor="portal-email" error={emailError ?? undefined}>
						<Input
							id="portal-email"
							type="email"
							inputMode="email"
							autoComplete="email"
							placeholder="you@example.com"
							value={email}
							aria-invalid={!!emailError}
							onChange={(e) => {
								setEmail(e.target.value);
								setEmailError(null);
							}}
						/>
					</Field>

					{isNewDevice && (
						<Field label="First name (optional)" htmlFor="portal-first-name">
							<Input
								id="portal-first-name"
								autoComplete="given-name"
								value={firstName}
								onChange={(e) => setFirstName(e.target.value)}
							/>
						</Field>
					)}
				</div>
			)}

			{hasPlans && (
				<div className="sticky bottom-0 -mx-4 border-t bg-background/90 px-4 py-3 backdrop-blur">
					<Button size="lg" className="w-full" disabled={!selected || busy} onClick={handlePay}>
						{busy && <Loader2 className="animate-spin" />}
						{selected ? `Pay ${formatCurrency(getPlanPricing(selected).final)}` : "Select a plan"}
					</Button>
					{isNewDevice && (
						<p className="mt-3 text-center text-[13px] text-muted-foreground">
							Already have an account?{" "}
							<button type="button" onClick={onLogin} className="font-medium text-primary hover:underline">
								Sign in
							</button>
						</p>
					)}
				</div>
			)}
		</div>
	);
}

"use client";

import { useState } from "react";
import { useHotspotPlans, useStartHotspotPurchase } from "../hooks/useHotspot";
import type { HotspotPlan, HotspotUser } from "../api/hotspot.types";

interface RouterContext {
	macAddress: string | null;
	ipAddress: string | null;
	identity: string | null;
}

interface HotspotPlanSelectProps {
	routerContext: RouterContext;

	knownUser?: HotspotUser | null;
	onRequiresLogin: (email: string, message?: string) => void; // CHANGED: added message param
}

export function HotspotPlanSelect({
	routerContext,
	knownUser,
	onRequiresLogin
}: HotspotPlanSelectProps) {
	const plansQuery = useHotspotPlans();
	const purchase = useStartHotspotPurchase();

	const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
	const [firstName, setFirstName] = useState(knownUser?.firstName ?? "");
	const [lastName, setLastName] = useState(knownUser?.lastName ?? "");
	const [email, setEmail] = useState(knownUser?.email ?? "");
	const [phone, setPhone] = useState(knownUser?.phone ?? "");
	const [formError, setFormError] = useState<string | null>(null);

	const isKnownUser = Boolean(knownUser);
	// NOTE: still guessing PaginatedResponse's field name here — confirm
	// against @/lib/api/types if this comes back empty despite plans existing.
	const plans: HotspotPlan[] = plansQuery.data?.data ?? [];

	async function handleSubmit() {
		setFormError(null);

		if (!selectedPlanId) {
			setFormError("Choose a plan to continue.");
			return;
		}

		// CHANGED: only require these fields when they're actually being
		// collected. For a trusted/known user, the inputs below are hidden
		// entirely — validating them anyway blocked submission with no way
		// for the user to fix it whenever any field from `knownUser` (e.g.
		// phone, which is optional on HotspotUser) came back empty.
		if (!isKnownUser && (!firstName || !lastName || !email || !phone)) {
			setFormError("All fields are required.");
			return;
		}

		if (!routerContext.macAddress) {
			setFormError("We couldn't detect your device. Please reconnect to WiFi.");
			return;
		}

		try {
			const result = await purchase.mutateAsync({
				firstName,
				lastName,
				email,
				phone,
				planId: selectedPlanId,
				macAddress: routerContext.macAddress,
				ipAddress: routerContext.ipAddress ?? "",
				identity: routerContext.identity ?? undefined
			});

			// CHANGED: was onRequiresLogin(email) — dropped result.message,
			// which StartHotspotPurchase already provides
			// ("Welcome back. Please login to continue.") specifically so
			// the user understands why they're being asked to sign in
			// instead of proceeding straight to payment.
			if (result.requiresLogin) {
				onRequiresLogin(email, result.message);
				return;
			}

			const checkoutUrl = result.payment?.gatewayResponse?.data?.authorization_url;
			if (!checkoutUrl) {
				setFormError("Could not start checkout. Please try again.");
				return;
			}

			window.location.href = checkoutUrl;
		} catch (err) {
			setFormError(err instanceof Error ? err.message : "Something went wrong.");
		}
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">Choose a plan</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					{isKnownUser ? "Renew to get back online." : "Pick a plan to get connected."}
				</p>
			</div>

			{!isKnownUser && (
				<div className="grid gap-3">
					<div className="grid grid-cols-2 gap-3">
						<div className="space-y-1.5">
							<label className="text-sm text-muted-foreground">First name</label>
							<input
								className="ui-input"
								value={firstName}
								onChange={(e) => setFirstName(e.target.value)}
							/>
						</div>
						<div className="space-y-1.5">
							<label className="text-sm text-muted-foreground">Last name</label>
							<input
								className="ui-input"
								value={lastName}
								onChange={(e) => setLastName(e.target.value)}
							/>
						</div>
					</div>
					<div className="space-y-1.5">
						<label className="text-sm text-muted-foreground">Email</label>
						<input
							type="email"
							className="ui-input"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
						/>
					</div>
					<div className="space-y-1.5">
						<label className="text-sm text-muted-foreground">Phone</label>
						<input
							className="ui-input"
							placeholder="+234 800 000 0000"
							value={phone}
							onChange={(e) => setPhone(e.target.value)}
						/>
					</div>
				</div>
			)}

			<div className="space-y-2">
				<label className="text-sm text-muted-foreground">Available plans</label>

				{plansQuery.isLoading && (
					<div className="text-sm text-muted-foreground">Loading plans…</div>
				)}

				{plansQuery.isError && (
					<div className="text-sm text-danger">Couldn't load plans. Please refresh.</div>
				)}

				<div className="grid gap-2">
					{plans.map((plan) => {
						const active = plan.id === selectedPlanId;
						return (
							<button
								key={plan.id}
								onClick={() => setSelectedPlanId(plan.id)}
								className={`ui-card !p-3 flex items-center justify-between text-left ${
									active ? "border-accent" : ""
								}`}
							>
								<div>
									<div className="text-sm font-medium">{plan.name}</div>
									<div className="text-[11px] text-muted-foreground">
										{plan.speedRate} · {plan.durationValue} {plan.durationUnit}
									</div>
								</div>
								<div className="text-sm">
									₦{plan.price.toLocaleString()}
								</div>
							</button>
						);
					})}
				</div>
			</div>

			{formError && <div className="text-sm text-danger">{formError}</div>}

			<button
				className="w-full ui-button ui-button-accent"
				onClick={handleSubmit}
				disabled={purchase.isPending}
			>
				{purchase.isPending ? "Starting checkout…" : "Continue to payment"}
			</button>
		</div>
	);
}
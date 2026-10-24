"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Check, CreditCard, Loader2, Lock, MapPin, Pencil, Wallet as WalletIcon } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Field } from "@/components/shared/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { getBestValueId } from "@/features/plans/lib/best-value";
import { getPlanPricing } from "@/features/plans/lib/pricing";
import { formatWalletAmount } from "@/features/wallet/lib/money";
import { formatCurrency, formatDataLimit, formatDuration } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useHotspotPlans, useRevokeDevice } from "../hooks/use-hotspots";
import { readRememberedEmail, rememberEmail } from "../lib/remembered-email";
import { hotspotsApi } from "../services/hotspots.api";
import type { HotspotClientInfo, HotspotRouter } from "../types/hotspots.types";
import { PortalPlanCard } from "./portal-plan-card";
import { PortalWalletPanel } from "./portal-wallet-panel";

const emailSchema = z.string().trim().email();

type PayMethod = "card" | "wallet";

interface PlanPickerProps {
	client: HotspotClientInfo;
	router: HotspotRouter;
	isNewDevice: boolean;
	knownEmail?: string | null;
	firstNameKnown?: string | null;
	onLogin: () => void;
	onExistingUser: (email: string) => void;
}

interface MethodCardProps {
	icon: typeof CreditCard;
	title: string;
	text: string;
	active: boolean;
	onSelect: () => void;
}

function MethodCard({ icon: Icon, title, text, active, onSelect }: MethodCardProps) {
	return (
		<button
			type="button"
			role="radio"
			aria-checked={active}
			onClick={onSelect}
			className={cn(
				"flex min-h-16 w-full items-center gap-3 rounded-2xl border bg-card p-4 text-left transition-all active:scale-[0.99]",
				active ? "border-primary bg-accent/40 ring-1 ring-primary" : "hover:border-primary/50"
			)}
		>
			<span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-background text-signal">
				<Icon className="size-5" />
			</span>
			<span className="min-w-0 flex-1">
				<span className="block text-sm font-semibold">{title}</span>
				<span className="block text-[12px] text-muted-foreground">{text}</span>
			</span>
			<span
				className={cn(
					"flex size-6 shrink-0 items-center justify-center rounded-full border",
					active ? "border-primary bg-primary text-primary-foreground" : "border-border"
				)}
			>
				{active && <Check className="size-3.5" strokeWidth={3} />}
			</span>
		</button>
	);
}

function buildCallbackUrl() {
	const url = new URL(window.location.href);
	url.searchParams.delete("reference");
	url.searchParams.delete("trxref");
	return url.toString();
}

export function PlanPicker({ client, router, isNewDevice, knownEmail, firstNameKnown, onLogin, onExistingUser }: PlanPickerProps) {
	const nav = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const { data: plans, isLoading, isError, refetch } = useHotspotPlans();
	const revoke = useRevokeDevice();
	const [step, setStep] = useState<"plans" | "confirm">("plans");
	const [method, setMethod] = useState<PayMethod>("card");
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [email, setEmail] = useState("");
	const [editingEmail, setEditingEmail] = useState(false);
	const [firstName, setFirstName] = useState("");
	const [emailError, setEmailError] = useState<string | null>(null);
	const [redirecting, setRedirecting] = useState(false);
	const start = useMutation({ mutationFn: hotspotsApi.start });

	useEffect(() => {
		const saved = knownEmail || readRememberedEmail();
		if (saved) setEmail(saved);
	}, [knownEmail]);

	const selected = plans?.find((p) => p.id === selectedId) ?? null;
	const bestValueId = useMemo(() => getBestValueId(plans ?? []), [plans]);
	const busy = start.isPending || redirecting;
	const hasPlans = !!plans && plans.length > 0;
	const pricing = selected ? getPlanPricing(selected) : null;
	const price = pricing?.final ?? 0;
	const emailOk = emailSchema.safeParse(email).success;
	const showEmailInput = !emailOk || editingEmail;

	function goBack() {
		setStep("plans");
		setEditingEmail(false);
		setEmailError(null);
	}

	async function pay(walletPassword?: string) {
		if (!selected || busy) return;
		const wallet = typeof walletPassword === "string";

		const parsed = emailSchema.safeParse(email);
		if (!parsed.success) {
			setEmailError("Enter a valid email so we can send your receipt");
			setEditingEmail(true);
			return;
		}

		const res = await start.mutateAsync({
			...client,
			email: parsed.data,
			firstName: isNewDevice && firstName.trim() ? firstName.trim() : undefined,
			planId: selected.id,
			...(wallet ? { payWith: "wallet" as const, password: walletPassword } : { callbackUrl: buildCallbackUrl() }),
		});

		if (!res.success) {
			if (res.code === "INSUFFICIENT_BALANCE") {
				const shortfall = (res.details as { shortfall?: number } | null | undefined)?.shortfall;
				toast.error(res.message, { description: shortfall ? `You need ${formatWalletAmount(shortfall)} more.` : undefined });
				return;
			}
			toast.error(res.code === "INVALID_CREDENTIALS" ? "Incorrect email or password" : res.message);
			return;
		}

		if (res.data.status === "EXISTING_USER") {
			toast.info(res.data.message);
			onExistingUser(parsed.data);
			goBack();
			return;
		}

		rememberEmail(parsed.data);
		setRedirecting(true);

		if (res.data.status === "PAID") {
			const next = new URLSearchParams(searchParams.toString());
			next.set("reference", res.data.reference);
			nav.replace(`${pathname}?${next.toString()}`);
			return;
		}

		window.location.assign(res.data.authorizationUrl);
	}

	async function notYou() {
		const res = await revoke.mutateAsync(client.macAddress);
		if (!res.success) toast.error(res.message);
	}

	if (step === "confirm" && selected && pricing) {
		return (
			<div className="space-y-5">
				<button type="button" onClick={goBack} className="inline-flex min-h-11 items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
					<ArrowLeft className="size-4" />
					Change plan
				</button>

				<div className="space-y-1">
					<h1 className="text-2xl font-semibold tracking-tight">Confirm and pay</h1>
					<p className="text-sm text-muted-foreground">Check your plan, then choose how you want to pay.</p>
				</div>

				<div className="card-elevated space-y-3 bg-surface-2 p-4">
					<div className="flex items-start justify-between gap-4">
						<div className="min-w-0">
							<p className="text-[11px] uppercase tracking-wider text-muted-foreground">Your plan</p>
							<p className="truncate text-lg font-semibold">{formatDuration(selected.durationValue, selected.durationUnit)}</p>
							<p className="text-[12px] text-muted-foreground">
								{selected.speedRate} · {formatDataLimit(selected.dataLimitBytes)} · {selected.devicesAllowed} {selected.devicesAllowed === 1 ? "device" : "devices"}
							</p>
						</div>
						<div className="shrink-0 text-right">
							<p className="text-mono text-2xl font-semibold">{formatCurrency(price)}</p>
							{pricing.hasDiscount && <p className="text-mono text-[12px] text-muted-foreground line-through">{formatCurrency(pricing.base)}</p>}
						</div>
					</div>
				</div>

				{showEmailInput ? (
					<div className="space-y-4">
						<Field label="Email for your receipt" htmlFor="portal-email" error={emailError ?? undefined} hint="We use this to find your account the next time you connect.">
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
								<Input id="portal-first-name" autoComplete="given-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
							</Field>
						)}
					</div>
				) : (
					<div className="flex items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3">
						<div className="min-w-0">
							<p className="text-[11px] text-muted-foreground">Receipt and account</p>
							<p className="truncate text-sm font-medium">{email}</p>
						</div>
						<button type="button" onClick={() => setEditingEmail(true)} className="inline-flex min-h-11 shrink-0 items-center gap-1.5 text-[13px] font-medium text-primary hover:underline">
							<Pencil className="size-3.5" />
							Change
						</button>
					</div>
				)}

				<div className="space-y-3">
					<h2 className="text-sm font-medium">Pay with</h2>
					<div role="radiogroup" aria-label="Payment method" className="space-y-3">
						<MethodCard icon={CreditCard} title="Card or bank transfer" text="Secure checkout on Paystack" active={method === "card"} onSelect={() => setMethod("card")} />
						<MethodCard icon={WalletIcon} title="WifiSpace wallet" text="Use your balance. Needs your password" active={method === "wallet"} onSelect={() => setMethod("wallet")} />
					</div>
				</div>

				{method === "card" ? (
					<div className="space-y-3">
						<Button size="lg" className="w-full" disabled={busy} onClick={() => pay()}>
							{busy ? <Loader2 className="animate-spin" /> : <Lock />}
							Pay {formatCurrency(price)}
						</Button>
						<p className="text-center text-[12px] text-muted-foreground">
							You&apos;ll pay on Paystack, then come straight back here. Your internet switches on automatically.
						</p>
					</div>
				) : emailOk ? (
					<PortalWalletPanel email={email.trim()} price={price} busy={busy} onPay={(password) => pay(password)} />
				) : (
					<p className="text-center text-[13px] text-muted-foreground">Enter the email you registered with above to use your wallet.</p>
				)}
			</div>
		);
	}

	return (
		<div className="space-y-5">
			<div className="space-y-2">
				<p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
					<MapPin className="size-3.5" />
					{router.location || router.name}
				</p>
				<h1 className="text-2xl font-semibold tracking-tight">{firstNameKnown ? `Welcome back, ${firstNameKnown}` : "Get online"}</h1>
				<p className="text-sm text-muted-foreground">Pick how long you need. Pay once, no sign-up.</p>
			</div>

			{isLoading && (
				<div className="space-y-3 pt-1">
					{[0, 1, 2].map((i) => (
						<Skeleton key={i} className="h-20 rounded-2xl" />
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
				<p className="card-elevated bg-surface-2 p-4 text-center text-sm text-muted-foreground">No plans are available right now. Please try again shortly.</p>
			)}

			{hasPlans && (
				<div role="radiogroup" aria-label="Plans" className="space-y-3 pt-2">
					{plans.map((plan) => (
						<PortalPlanCard
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
				<div className="space-y-3">
					<div className="sticky bottom-0 -mx-4 border-t bg-background/90 px-4 py-3 backdrop-blur">
						<Button size="lg" className="w-full" disabled={!selected} onClick={() => setStep("confirm")}>
							{selected ? `Continue · ${formatCurrency(price)}` : "Select a plan"}
						</Button>
					</div>

					<p className="text-center text-[13px] text-muted-foreground">
						{isNewDevice ? (
							<>
								Already have an account?{" "}
								<button type="button" onClick={onLogin} className="font-medium text-primary hover:underline">
									Sign in
								</button>
							</>
						) : (
							<>
								Not you?{" "}
								<button type="button" disabled={revoke.isPending} onClick={notYou} className="font-medium text-primary hover:underline">
									Use a different account
								</button>
							</>
						)}
					</p>
				</div>
			)}
		</div>
	);
}

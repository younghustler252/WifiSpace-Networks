"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";

import { planApi } from "@/lib/api/plan";
import { paymentApi } from "@/lib/api/payment";
import { calculateBonusDays } from "@/lib/utils/BonusDay";

import PageHeader from "@/components/ui/PageHeader";
import { CenterLoader } from "@/components/ui/Loader";
import PlanCard from "@/features/plan/PlanCard";
import Button from "@/components/ui/Button";

import { useCreatePayment } from "@/features/payment/hooks/usePayment";
import { useSubscription } from "@/features/subscription/hooks/useSubscription";
import { useAuth } from "@/context/AuthContext";

import Modal, {
	ModalHeader,
	ModalBody,
	ModalFooter,
} from "@/components/ui/Modal";

export default function PlansPage() {
	const { activeAccount } = useAuth();

	// ================= SUBSCRIPTION =================
	const { subscription } = useSubscription(activeAccount?.id ?? "");
	const currentPlan = subscription?.planId;

	// ================= STATE =================
	const [selectedPlan, setSelectedPlan] = useState<any | null>(null);
	const [cycles, setCycles] = useState(1);
	const [sort, setSort] = useState("");

	const cleanSort = sort || "price_desc";

	// ================= MODE FLAGS =================
	const isNoAccount = !activeAccount;
	const isHasAccount = !!activeAccount;
	const isUpgradeMode = !!currentPlan && isHasAccount;

	// ================= FETCH PLANS =================
	const { data: plansData, isLoading, error } = useQuery({
		queryKey: [
			"plans",
			activeAccount?.serviceType,
			activeAccount?.accountType,
			sort,
		],
		queryFn: () => {
			const isPPPoE = activeAccount?.serviceType === "pppoe";

			return planApi.getAll({
				serviceType: activeAccount?.serviceType,
				accountType: isPPPoE ? activeAccount?.accountType : undefined,
				sort: cleanSort,
			});
		},
		enabled: true, // ALWAYS fetch (important for explore mode)
	});

	const plans = plansData?.data?.data || [];

	// ================= FILTERING LOGIC =================

	const visiblePlans = useMemo(() => {
		// ================= NO ACCOUNT → SHOW EVERYTHING =================
		if (isNoAccount) {
			return [...plans];
		}

		// ================= HAS ACCOUNT → SHOW CURRENT + HIGHER ONLY =================
		if (!currentPlan) return plans;

		return plans.filter((plan: any) => {
			const isCurrent =
				plan.id === currentPlan._id ||
				plan._id === currentPlan._id;

			const isHigher =
				Number(plan.price) > Number(currentPlan.price);

			return isCurrent || isHigher;
		});
	}, [plans, isNoAccount, currentPlan]);

	// ================= SORT =================
	const sortedPlans = useMemo(() => {
		const arr = [...visiblePlans];

		if (cleanSort === "price_asc") {
			return arr.sort((a, b) => a.price - b.price);
		}

		if (cleanSort === "price_desc") {
			return arr.sort((a, b) => b.price - a.price);
		}

		return arr;
	}, [visiblePlans, cleanSort]);

	// ================= PAYMENT =================
	const { mutate: createPayment, isPending } = useCreatePayment();

	const handlePay = () => {
		if (!selectedPlan || !activeAccount) return;

		createPayment(
			{
			accountId: activeAccount.id,
			planId: selectedPlan.id,
			cycles,
			paymentChannel: "card",
			},
		{
		onSuccess: (data) => {
			const url = data.gatewayResponse?.data.authorization_url;

			if (!url) {
			console.error("No Paystack authorization URL returned.", data);
			return;
			}

			window.location.href = url;
		},
		onError: (err) => {
			console.error(err);
		},
	});
	}

	// ================= LOADING =================
	if (isLoading)
		return <CenterLoader label="Loading Plans..." />;

	if (error) {
		return (
			<div className="p-6 text-center text-danger">
				Failed to load plans
			</div>
		);
	}

	return (
		<>
			<PageHeader title="Plans" />

			<main className="p-4 md:p-8">
				<div className="max-w-6xl pb-12 mx-auto ui-stack-lg">

					{/* Unauthenticated Explore Banner */}
					{isNoAccount && (
						<div className="p-4 text-sm border rounded-xl bg-muted">
							Explore all available plans. Select an account to activate subscription.
						</div>
					)}

					{/* Controls and Sorting Header */}
					<div className="flex flex-col items-center justify-between gap-4 ui-card md:flex-row">
						<div>
							<h2 className="text-xl font-semibold">
								{isNoAccount ? "Explore Plans" : "Your Plans"}
							</h2>

							<p className="text-sm text-muted-foreground">
								{isNoAccount
									? "Viewing all available PPPoE and Hotspot plans"
									: isUpgradeMode
									? "Current plan and upgrade options available"
									: "Choose a plan to get started"}
							</p>
						</div>

						<select
							value={sort}
							onChange={(e) => setSort(e.target.value)}
							className="ui-input max-w-[200px]"
						>
							<option value="">Default</option>
							<option value="price_asc">Price: Low → High</option>
							<option value="price_desc">Price: High → Low</option>
						</select>
					</div>

					{/* Filtered Plans Grid Matrix */}
					<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
						{sortedPlans.map((plan: any) => {
							const planId = plan._id || plan.id;
							const currentPlanId = typeof currentPlan === "string" 
								? currentPlan 
								: currentPlan?._id;

							const isCurrent = currentPlan && planId === currentPlanId;
							const isDisabled = isNoAccount;

							return (
								<PlanCard
									key={planId}
									plan={plan}
									isCurrent={!!isCurrent}
									disabled={isDisabled}
									onSelect={(p) => {
										if (isNoAccount) return;
										setSelectedPlan(p);
										setCycles(1);
									}}
								/>
							);
						})}
					</div>

					{/* Empty Result Callback Wrapper */}
					{sortedPlans.length === 0 && (
						<div className="p-6 mt-6 text-center border rounded-xl">
							No plans available
						</div>
					)}
				</div>
			</main>


			{/* ================= MODAL ================= */}
			<Modal
				open={!!selectedPlan}
				onClose={() => setSelectedPlan(null)}
			>
				<ModalHeader>
					<span className="text-lg font-semibold tracking-tight text-foreground">
						{isUpgradeMode ? "Confirm Plan Upgrade" : "Confirm New Subscription"}
					</span>
				</ModalHeader>

				<ModalBody>
					{selectedPlan && (
						<div className="space-y-5">
							{/* Pricing Highlights Matrix Card */}
							<div className="flex items-center justify-between p-5 border border-accent/10 rounded-2xl bg-accent/5">
								<div>
									<p className="text-xs font-semibold tracking-wider uppercase text-accent">
										{isUpgradeMode ? "Selected Upgrade Tier" : "Target Plan Tier"}
									</p>
									<h2 className="mt-1 text-xl font-bold text-foreground">
										{selectedPlan.name}
									</h2>
									<p className="text-xs text-muted-foreground mt-0.5 capitalize">
										Mode: {selectedPlan.serviceType} Connection
									</p>
								</div>
								<div className="text-right">
									<p className="text-xs font-medium tracking-wider uppercase text-muted-foreground">Total Due</p>
									<p className="text-2xl font-black text-foreground mt-0.5">
										₦{(selectedPlan.price * cycles).toLocaleString()}
									</p>
								</div>
							</div>

							{/* Quantifiable Cycle Allocation Counter Grid */}
							<div className="flex items-center justify-between p-4 border border-border rounded-xl bg-muted/20">
								<div>
									<span className="text-sm font-semibold text-foreground">Subscription Term Cycles</span>
									<p className="text-xs text-muted-foreground">Adjust billing intervals for this purchase</p>
								</div>

								<div className="flex items-center gap-3 bg-background border border-border p-1.5 rounded-lg shadow-sm">
									<button
										type="button"
										onClick={() => setCycles(Math.max(1, cycles - 1))}
										className="flex items-center justify-center font-bold transition-colors border border-transparent rounded-md h-7 w-7 text-muted-foreground hover:bg-muted hover:text-foreground active:border-border"
									>
										—
									</button>
									<span className="text-sm font-bold px-2 min-w-[20px] text-center text-foreground">
										{cycles}
									</span>
									<button
										type="button"
										onClick={() => setCycles(cycles + 1)}
										className="flex items-center justify-center font-bold transition-colors border border-transparent rounded-md h-7 w-7 text-muted-foreground hover:bg-muted hover:text-foreground active:border-border"
									>
										＋
									</button>
								</div>
							</div>

							{/* Structural Duration Estimates Grid */}
							<div className="grid grid-cols-2 gap-4">
								<div className="p-4 border border-border rounded-xl bg-muted/10">
									<span className="block text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
										Base Value Length
									</span>
									<span className="block mt-1 text-base font-bold text-foreground">
										{selectedPlan.durationValue * cycles} {selectedPlan.durationUnit}
									</span>
								</div>

								<div className="p-4 border border-border rounded-xl bg-muted/10">
									<span className="block text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
										Net Active Timeline
									</span>
									<span className="block mt-1 text-base font-bold text-accent">
										{(selectedPlan.durationValue * cycles) + calculateBonusDays(selectedPlan, cycles)} Days
									</span>
								</div>
							</div>
						</div>
					)}
				</ModalBody>

				<ModalFooter>
					<Button
						variant="accent"
						isLoading={isPending}
						fullWidth
						onClick={handlePay}
					>
						{isUpgradeMode ? "Authorize Upgrade Invoice" : "Proceed to Secure Payment Gateway"}
					</Button>
				</ModalFooter>
			</Modal>

		</>
	);
}
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
	const { mutate: createPayment, isPending } = useMutation({
		mutationFn: paymentApi.create,
		onSuccess: (res) => {
			const url =
				res?.data?.paystack?.data?.authorization_url;

			if (url) window.open(url, "_blank");
		},
		onError: (err) => {
			console.error("Payment error:", err);
		},
	});

	const handlePay = () => {
		if (!selectedPlan || !activeAccount) return;

		createPayment({
			accountId: activeAccount.id,
			planId: selectedPlan.id,
			cycles,
			paymentChannel: "card",
		});
	};

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
				<div className="max-w-6xl mx-auto ui-stack-lg pb-12">

					{/* Unauthenticated Explore Banner */}
					{isNoAccount && (
						<div className="p-4 border rounded-xl bg-muted text-sm">
							Explore all available plans. Select an account to activate subscription.
						</div>
					)}

					{/* Controls and Sorting Header */}
					<div className="ui-card flex flex-col md:flex-row items-center justify-between gap-4">
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
						<div className="text-center p-6 border rounded-xl mt-6">
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
							<div className="p-5 border border-accent/10 rounded-2xl bg-accent/5 flex items-center justify-between">
								<div>
									<p className="text-xs font-semibold text-accent uppercase tracking-wider">
										{isUpgradeMode ? "Selected Upgrade Tier" : "Target Plan Tier"}
									</p>
									<h2 className="text-xl font-bold text-foreground mt-1">
										{selectedPlan.name}
									</h2>
									<p className="text-xs text-muted-foreground mt-0.5 capitalize">
										Mode: {selectedPlan.serviceType} Connection
									</p>
								</div>
								<div className="text-right">
									<p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Due</p>
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
										className="h-7 w-7 flex items-center justify-center rounded-md font-bold text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent active:border-border transition-colors"
									>
										—
									</button>
									<span className="text-sm font-bold px-2 min-w-[20px] text-center text-foreground">
										{cycles}
									</span>
									<button
										type="button"
										onClick={() => setCycles(cycles + 1)}
										className="h-7 w-7 flex items-center justify-center rounded-md font-bold text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent active:border-border transition-colors"
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
									<span className="text-base font-bold text-foreground mt-1 block">
										{selectedPlan.durationValue * cycles} {selectedPlan.durationUnit}
									</span>
								</div>

								<div className="p-4 border border-border rounded-xl bg-muted/10">
									<span className="block text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
										Net Active Timeline
									</span>
									<span className="text-base font-bold text-accent mt-1 block">
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
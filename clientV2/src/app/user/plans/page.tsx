"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";

import { planApi } from "@/lib/api/plan";
import { paymentApi } from "@/lib/api/payment";
import { calculateBonusDays } from "@/lib/utils/BonusDay";

import PageHeader from "@/components/ui/PageHeader";
import { CenterLoader } from "@/components/ui/Loader";
import PlanCard from "@/components/plan/PlanCard";
import Button from "@/components/ui/Button";

import Modal, {
	ModalHeader,
	ModalBody,
	ModalFooter,
} from "@/components/ui/Modal";

import { useAuth } from "@/context/AuthContext";

export default function PlansPage() {
	const { activeAccount } = useAuth();

	const [selectedPlan, setSelectedPlan] = useState<any | null>(null);
	const [cycles, setCycles] = useState(1);
	const [sort, setSort] = useState("");
	const cleanSort =
	sort || "price_desc";

	// ================= QUERY =================

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

			accountType: isPPPoE
				? activeAccount?.accountType
				: undefined,

			sort: cleanSort,
		});
	},

	enabled: !!activeAccount,
});

	const plans = plansData?.data?.data || [];

	// ================= PAYMENT =================

	const { mutate: createPayment, isPending } = useMutation({
		mutationFn: paymentApi.create,

		onSuccess: (res) => {
			const url =
				res?.data?.paystack?.data?.authorization_url;

			if (url) {
				window.open(url, "_blank");
			} else {
				console.warn(
					"No redirect URL returned from backend"
				);
			}
		},

		onError: (err) => {
			console.error("Payment error:", err);
		},
	});

	// ================= HANDLER =================

	const handlePay = () => {
		if (!selectedPlan || !activeAccount) return;

		createPayment({
			accountId: activeAccount.id,
			planId: selectedPlan.id,
			cycles,
			method: "paystack",
		});
	};

	// ================= STATES =================

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

					{/* HEADER */}

					<div className="ui-card flex flex-col md:flex-row items-center justify-between gap-4">
						<div>
							<h2 className="text-xl font-semibold">
								Available Plans
							</h2>

							<p className="text-sm text-muted-foreground">
								Choose a plan that fits your needs
							</p>
						</div>

						<select
							value={sort}
							onChange={(e) =>
								setSort(e.target.value)
							}
							className="ui-input max-w-[200px]"
						>
							<option value="">
								Default
							</option>

							<option value="price_asc">
								Price: Low → High
							</option>

							<option value="price_desc">
								Price: High → Low
							</option>
						</select>
					</div>

					{/* GRID */}

					<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
						{plans.map((plan: any) => (
							<PlanCard
								key={plan.id}
								plan={plan}
								onSelect={(p) => {
									setSelectedPlan(p);
									setCycles(1);
								}}
							/>
						))}
					</div>
				</div>
			</main>

			{/* ================= MODAL ================= */}

			<Modal
				open={!!selectedPlan}
				onClose={() => setSelectedPlan(null)}
			>
				<ModalHeader>
					<span className="text-lg font-semibold">
						Confirm Subscription
					</span>
				</ModalHeader>

				<ModalBody>
					{selectedPlan &&
						(() => {
							const baseDuration =
								selectedPlan.durationValue *
								cycles;

							const bonusDays =
								calculateBonusDays(
									selectedPlan,
									cycles
								);

							const totalDuration =
								baseDuration + bonusDays;

							const totalPrice =
								selectedPlan.price *
								cycles;

							return (
								<div className="space-y-6">

									{/* HERO */}

									<div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-accent/20 via-background to-background border border-border shadow-lg">

										<div className="absolute -top-10 -right-10 w-40 h-40 bg-accent/20 blur-3xl rounded-full" />

										<p className="text-sm text-muted-foreground">
											You're subscribing to
										</p>

										<h2 className="text-xl font-bold mt-1">
											{selectedPlan.name}
										</h2>

										<div className="mt-5">
											<p className="text-4xl font-extrabold tracking-tight">
												₦
												{totalPrice.toLocaleString()}
											</p>

											<p className="text-xs text-muted-foreground mt-1">
												for {cycles} cycle
												{cycles > 1 ? "s" : ""}
											</p>
										</div>
									</div>

									{/* DETAILS */}

									<div className="grid grid-cols-2 gap-3">

										<div className="p-4 rounded-xl bg-muted/40 border">
											<p className="text-xs text-muted-foreground">
												Base Duration
											</p>

											<p className="font-semibold mt-1">
												{baseDuration}{" "}
												{selectedPlan.durationUnit}
											</p>
										</div>

										<div className="p-4 rounded-xl bg-muted/40 border">
											<p className="text-xs text-muted-foreground">
												Total Access
											</p>

											<p className="font-semibold mt-1">
												{totalDuration} days
											</p>
										</div>
									</div>

									{/* BONUS */}

									{bonusDays > 0 && (
										<div className="p-4 rounded-xl border border-green-500/30 bg-green-500/5">
											<p className="text-sm text-green-600 font-medium">
												🎁 Bonus unlocked
											</p>

											<p className="text-xs text-muted-foreground mt-1">
												+{bonusDays} extra days added
											</p>
										</div>
									)}

									{/* CYCLES */}

									<div className="flex items-center justify-between p-4 rounded-xl border bg-background">
										<span className="text-sm font-medium">
											Cycles
										</span>

										<div className="flex items-center gap-4">
											<button
												onClick={() =>
													setCycles(
														Math.max(
															1,
															cycles - 1
														)
													)
												}
												className="w-10 h-10 rounded-full border hover:bg-muted"
											>
												-
											</button>

											<span className="font-semibold text-lg">
												{cycles}
											</span>

											<button
												onClick={() =>
													setCycles(
														cycles + 1
													)
												}
												className="w-10 h-10 rounded-full border hover:bg-muted"
											>
												+
											</button>
										</div>
									</div>
								</div>
							);
						})()}
				</ModalBody>

				<ModalFooter>
					<Button
						variant="primary"
						isLoading={isPending}
						fullWidth
						size="lg"
						onClick={handlePay}
					>
						Pay ₦
						{selectedPlan
							? (
									selectedPlan.price *
									cycles
							  ).toLocaleString()
							: 0}
					</Button>
				</ModalFooter>
			</Modal>
		</>
	);
}
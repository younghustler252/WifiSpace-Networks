import React from "react";
import SubscriptionCard from "../components/SubscriptionCard";
import {
	useAllPlans,
	useCurrentSubscription
} from "../hooks/useSubscription";
import { Spinner } from "../components/ui/Loader";
import CircularProgress from "../components/CircularProgress";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { ROUTE } from "../Routes/Route";
import { ArrowRight } from "lucide-react";

const Subscription = () => {
	const { user } = useAuth();
	const navigate = useNavigate();

	const {
		data: plansData = [],
		isLoading: plansLoading,
		isError: plansError
	} = useAllPlans();

	const {
		data: currentSub = null,
		isLoading: currentSubLoading,
		isError: currentSubError
	} = useCurrentSubscription();

	/* ---- Guards ---- */
	if (!user)
		return (
			<p className="text-center text-red-500">
				Please login to view subscriptions.
			</p>
		);

	if (plansLoading || currentSubLoading)
		return (
			<Spinner message="Loading subscription details..." />
		);

	if (plansError || currentSubError)
		return (
			<p className="text-center text-red-500">
				Failed to load subscription data.
			</p>
		);

	/* ---- Progress helper ---- */
	const getProgress = (start, end) => {
		if (!start || !end)
			return {
				percent: 0,
				daysLeft: 0,
				totalDays: 0
			};

		const s = new Date(start);
		const e = new Date(end);
		const now = new Date();

		const totalDays = Math.ceil(
			(e - s) / (1000 * 60 * 60 * 24)
		);
		const usedDays = Math.ceil(
			(now - s) / (1000 * 60 * 60 * 24)
		);
		const daysLeft = Math.max(
			totalDays - usedDays,
			0
		);
		const percent = Math.min(
			Math.max(
				Math.floor((daysLeft / totalDays) * 100),
				0
			),
			100
		);

		return { percent, daysLeft, totalDays };
	};

	const { percent, daysLeft, totalDays } = currentSub
		? getProgress(currentSub.start, currentSub.end)
		: {
				percent: 0,
				daysLeft: 0,
				totalDays: 0
		  };

	/* ---- Safe navigation (NORMALIZE PLAN) ---- */
	const handleSelectPlan = (plan) => {
		if (!plan) return;

		const normalizedPlan = {
			_id: plan._id || plan.id, // ✅ supports both flows
			planName: plan.planName,
			price: plan.price
		};

		if (!normalizedPlan._id) {
			console.error("Invalid plan selected:", plan);
			return;
		}

		navigate(ROUTE.confirmPayment, {
			state: { plan: normalizedPlan }
		});
	};

	return (
		<div className="max-w-6xl mx-auto px-6 py-10 space-y-12">
			{/* Header */}
			<div className="space-y-2">
				<h1 className="text-4xl font-bold tracking-tight">
					Subscription
				</h1>
				<p className="text-muted-foreground max-w-xl">
					Manage your plan, track usage, or extend your
					access anytime.
				</p>
			</div>

			{/* Current subscription */}
			{currentSub && (
				<div className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-primary/5 to-transparent p-8">
					<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
						<div className="space-y-3">
							<p className="text-xs uppercase tracking-wide text-muted-foreground">
								Current plan
							</p>
							<h2 className="text-2xl font-bold">
								{currentSub.planName}
							</h2>

							<p className="text-sm text-muted-foreground">
								Expires on{" "}
								<strong>
									{new Date(
										currentSub.end
									).toLocaleDateString()}
								</strong>
							</p>

							<p className="text-sm">
								<strong>{daysLeft}</strong>{" "}
								days remaining out of {totalDays}
							</p>
						</div>

						<div className="flex items-center gap-6">
							<CircularProgress percent={percent} />

							{/* Extend plan */}
							<div
								onClick={() =>
									handleSelectPlan({
										id: currentSub.id, // ✅ backend Subscription ID
										planName:
											currentSub.planName,
										price: currentSub.price
									})
								}
								className="group cursor-pointer flex items-center gap-2 text-primary font-semibold"
							>
								Extend plan
								<ArrowRight
									size={16}
									className="group-hover:translate-x-1 transition-transform"
								/>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Divider */}
			<div className="flex items-center gap-4">
				<div className="flex-1 h-px bg-border" />
				<span className="text-xs uppercase text-muted-foreground tracking-wide">
					Available plans
				</span>
				<div className="flex-1 h-px bg-border" />
			</div>

			{/* Plans grid */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
				{plansData.map((plan) => (
					<SubscriptionCard
						key={plan._id}
						plan={plan}
						isCurrent={plan._id === currentSub?.id}
						onSelect={handleSelectPlan}
					/>
				))}
			</div>
		</div>
	);
};

export default Subscription;

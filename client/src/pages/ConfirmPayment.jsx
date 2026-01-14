import React, { useState, useMemo } from "react";
import { useLocation, Navigate } from "react-router-dom";
import { Gift, Plus, Minus } from "lucide-react";
import { useInitiatePayment } from "../hooks/usePayment";
import { Spinner } from "../components/ui/Loader";
import { useAuth } from "../hooks/useAuth";
import { ROUTE } from "../Routes/Route";

const MAX_MONTHS = 12;

const calculateBonusDays = (months) => {
	if (months >= 12) return 30;
	return Math.floor(months / 3) * 7;
};

const ConfirmPayment = () => {
	const { state } = useLocation();
	const { user } = useAuth();

	const plan = state?.plan;

	/* ---- HARD GUARDS (NO SIDE EFFECTS) ---- */
	if (!user?._id) {
		return <Navigate to={ROUTE.login} replace />;
	}

	if (!plan?._id || typeof plan.price !== "number") {
		console.error("Invalid plan data:", plan);
		return <Navigate to={ROUTE.subscription} replace />;
	}

	const [months, setMonths] = useState(1);

	const { mutateAsync: initiatePayment, isLoading } =
		useInitiatePayment();

	/* ---- Safe calculations ---- */
	const bonusDays = useMemo(
		() => calculateBonusDays(months),
		[months]
	);

	const totalDays = months * 30 + bonusDays;

	const monthlyPrice = Number(plan.price);
	const totalAmount = monthlyPrice * months;

	/* ---- Month controls (locked) ---- */
	const increment = () =>
		setMonths((m) => Math.min(MAX_MONTHS, m + 1));

	const decrement = () =>
		setMonths((m) => Math.max(1, m - 1));

	/* ---- Payment ---- */
	const handlePay = async () => {
		try {
			if (!Number.isInteger(months) || months < 1) {
				throw new Error("Invalid billing duration");
			}

			if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
				throw new Error("Invalid payment amount");
			}

			const payload = {
				userId: user._id,
				planId: plan._id,
				monthsPaid: months,
				amount: totalAmount
			};

			const { paymentUrl } =
				await initiatePayment(payload);

			window.location.href = paymentUrl;
		} catch (err) {
			console.error("Payment initiation failed:", err);
			alert(
				err?.message ||
					"Payment initiation failed"
			);
		}
	};

	return (
		<div className="max-w-lg mx-auto p-6 space-y-6">
			<h1 className="text-2xl font-bold">
				Confirm your subscription
			</h1>

			{/* Plan summary */}
			<div className="rounded-2xl border p-5 space-y-1">
				<p className="text-lg font-semibold">
					{plan.planName}
				</p>
				<p className="text-sm text-muted-foreground">
					₦{monthlyPrice.toLocaleString()} / month
				</p>
			</div>

			{/* Duration selector */}
			<div className="flex items-center justify-between rounded-2xl border p-4">
				<span className="font-semibold">
					Billing duration
				</span>

				<div className="flex items-center gap-3">
					<button
						onClick={decrement}
						disabled={months === 1}
						className="p-2 rounded-lg border disabled:opacity-40"
					>
						<Minus size={16} />
					</button>

					<span className="text-lg font-bold">
						{months} month{months > 1 && "s"}
					</span>

					<button
						onClick={increment}
						disabled={months === MAX_MONTHS}
						className="p-2 rounded-lg border disabled:opacity-40"
					>
						<Plus size={16} />
					</button>
				</div>
			</div>

			{/* Bonus */}
			{bonusDays > 0 && (
				<div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 flex gap-3">
					<Gift className="text-emerald-600" />
					<div>
						<p className="font-semibold text-emerald-700">
							Loyalty bonus unlocked
						</p>
						<p className="text-sm text-emerald-700">
							Enjoy{" "}
							<strong>
								{bonusDays} extra days
							</strong>{" "}
							on us.
						</p>
					</div>
				</div>
			)}

			{/* Summary */}
			<div className="rounded-2xl border p-4 space-y-2 text-sm">
				<p>
					Total access:
					<strong> {totalDays} days</strong>
				</p>
				<p>
					Total charge:
					<strong>
						{" "}
						₦{totalAmount.toLocaleString()}
					</strong>
				</p>
			</div>

			<button
				onClick={handlePay}
				disabled={isLoading}
				className="w-full py-3 rounded-2xl bg-primary text-white font-semibold"
			>
				{isLoading ? <Spinner /> : "Proceed to payment"}
			</button>
		</div>
	);
};

export default ConfirmPayment;

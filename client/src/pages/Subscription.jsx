import React, { useState } from "react";
import SubscriptionCard from "../components/SubscriptionCard";
import { useAllPlans, useCurrentSubscription } from "../hooks/useSubscription";
import { useInitiatePayment } from "../hooks/usePayment";
import { Spinner } from "../components/ui/Loader";
import { RefreshCcw } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

/* --- Helper: Calculate subscription progress --- */
const getSubscriptionProgress = (start, end) => {
    if (!start || !end) return { percent: 0, daysLeft: 0, totalDays: 0 };
    const s = new Date(start);
    const e = new Date(end);
    const now = new Date();
    const totalDays = Math.ceil((e - s) / (1000 * 60 * 60 * 24));
    const passed = Math.ceil((now - s) / (1000 * 60 * 60 * 24));
    const daysLeft = Math.max(totalDays - passed, 0);

    // percent = remaining time
    const percent = Math.min(Math.max(Math.floor((daysLeft / totalDays) * 100), 0), 100);

    return { percent, daysLeft, totalDays };
};

/* --- Circular Progress --- */
const CircularProgress = ({ percent }) => {
    const radius = 40;
    const stroke = 6;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percent / 100) * circumference;

    const getColor = () => {
        if (percent >= 70) return "#22c55e"; // green
        if (percent >= 30) return "#eab308"; // yellow
        return "#ef4444"; // red
    };

    return (
        <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
            <circle
                stroke="#e5e7eb"
                fill="transparent"
                strokeWidth={stroke}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
            />
            <circle
                stroke={getColor()}
                fill="transparent"
                strokeWidth={stroke}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-500"
            />
            <text
                x="50%"
                y="50%"
                dy="0.35em"
                textAnchor="middle"
                className="font-bold text-sm"
                fill={getColor()}
            >
                {percent}%
            </text>
        </svg>
    );
};

const Subscription = () => {
    const { user } = useAuth();
    const [processingPlanId, setProcessingPlanId] = useState(null);

    const { data: plansData = [], isLoading: plansLoading, isError: plansError } = useAllPlans();
    const { data: currentSub = null, isLoading: currentSubLoading, isError: currentSubError } = useCurrentSubscription();
    const { mutateAsync: initiatePayment } = useInitiatePayment();
    const isAnyProcessing = processingPlanId !== null;

    if (!user) return <p className="text-center text-red-500">Please login to view subscriptions.</p>;
    if (plansLoading || currentSubLoading) return <Spinner message="Loading subscription data..." />;
    if (plansError || currentSubError) return <p className="text-red-500 text-center">Failed to load subscription data.</p>;

    const { percent, daysLeft, totalDays } = currentSub
        ? getSubscriptionProgress(currentSub.start, currentSub.end)
        : { percent: 0, daysLeft: 0, totalDays: 0 };

    const handlePurchase = async (planId, planName, amount) => {
        if (!user?._id) return alert("Please login to purchase a plan.");
        const numericAmount = Number(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) return alert("Invalid plan amount.");

        try {
            setProcessingPlanId(planId);
            const { paymentUrl } = await initiatePayment({
                userId: user._id,
                planId,
                planName,
                amount: numericAmount,
                email: user.email,
            });
            window.location.href = paymentUrl;
        } catch (err) {
            console.error(err);
            alert("Failed to initiate payment.");
            setProcessingPlanId(null);
        }
    };

    const handleRenew = () => alert("Renewal will be handled after payment upgrade.");

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8">
            <h1 className="text-3xl font-bold text-primary mb-6">Subscription Plans</h1>

            {/* Current Subscription */}
            {currentSub ? (
                <div className="p-6 rounded-2xl border shadow-md bg-card dark:bg-gray-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    {/* Plan info */}
                    <div className="flex-1 space-y-2 text-sm text-muted-foreground">
                        <p><strong>Plan:</strong> {currentSub.planName}</p>
                        <p>
                            <strong>Status:</strong>{" "}
                            <span
                                className={`px-2 py-1 rounded-full text-xs font-semibold ${currentSub.status === "active"
                                    ? "bg-green-100 text-green-700"
                                    : currentSub.status === "expired"
                                        ? "bg-red-100 text-red-700"
                                        : "bg-yellow-100 text-yellow-700"
                                    }`}
                            >
                                {currentSub.status}
                            </span>
                        </p>
                        <p><strong>Expires:</strong> {new Date(currentSub.end).toLocaleDateString()}</p>
                        <p><strong>Days left:</strong> {daysLeft} / {totalDays}</p>
                    </div>

                    {/* Circular progress + Renew */}
                    <div className="flex flex-col items-center gap-2">
                        <CircularProgress percent={percent} />
                        <button
                            onClick={handleRenew}
                            className="mt-2 px-4 py-2 rounded-xl border border-primary text-primary font-semibold hover:bg-primary/10"
                        >
                            Renew
                        </button>
                    </div>
                </div>
            ) : (
                <div className="p-6 rounded-xl bg-yellow-50 border text-center">
                    <p className="font-semibold">You do not have an active subscription.</p>
                    <p className="text-sm">Choose a plan below to get started.</p>
                </div>
            )}

            {/* Available Plans */}
            <h2 className="text-xl font-semibold text-primary">Available Plans</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {plansData.map((plan) => (
                    <SubscriptionCard
                        key={plan._id}
                        plan={plan}
                        isCurrent={plan._id === currentSub?.id}
                        onPurchase={handlePurchase}
                        onRenew={handleRenew}
                        isLoading={processingPlanId === plan._id}
                        isDisabled={isAnyProcessing && processingPlanId !== plan._id}
                    />
                ))}
            </div>
        </div>
    );
};

export default Subscription;

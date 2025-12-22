import React, { useState } from "react";
import SubscriptionCard from "../components/SubscriptionCard";
import { useAllPlans, useCurrentSubscription } from "../hooks/useSubscription";
import { useInitiatePayment } from "../hooks/usePayment";
import { Spinner } from "../components/ui/Loader";
import { RefreshCcw } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

// Helper: Calculate subscription progress
const getSubscriptionProgress = (start, end) => {
    if (!start || !end) return { percent: 0, daysLeft: 0, totalDays: 0 };
    const s = new Date(start);
    const e = new Date(end);
    const now = new Date();
    const totalDays = Math.ceil((e - s) / (1000 * 60 * 60 * 24));
    const passed = Math.ceil((now - s) / (1000 * 60 * 60 * 24));
    const daysLeft = Math.max(totalDays - passed, 0);
    const percent = Math.min(Math.max(Math.floor((passed / totalDays) * 100), 0), 100);
    return { percent, daysLeft, totalDays };
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
                <div className="p-6 rounded-2xl border shadow-md bg-surface dark:bg-black/40">
                    <h2 className="text-2xl font-semibold mb-3">Your Current Subscription</h2>
                    <div className="flex flex-col gap-2">
                        <p><strong>Plan:</strong> {currentSub.planName}</p>
                        <p>
                            <strong>Status:</strong>{" "}
                            <span
                                className={`px-2 py-1 rounded-full ${currentSub.status === "active"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-red-100 text-red-700"
                                    }`}
                            >
                                {currentSub.status}
                            </span>
                        </p>
                        <p><strong>Expires:</strong> {new Date(currentSub.end).toLocaleDateString()}</p>
                        <p><strong>Days left:</strong> {daysLeft} / {totalDays} days</p>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full h-3 rounded-full bg-surface-hover overflow-hidden my-4">
                        <div className="h-full bg-primary transition-all" style={{ width: `${percent}%` }} />
                    </div>

                    <div className="flex gap-3 flex-wrap">
                        <button
                            onClick={handleRenew}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-black font-semibold hover:bg-primary/90"
                        >
                            <RefreshCcw size={18} /> Renew
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

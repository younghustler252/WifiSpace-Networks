import React from "react";
import { CheckCircle, Star, Zap, Users, TrendingUp } from "lucide-react";
import { Spinner } from "./ui/Loader";

const SubscriptionCard = ({
    plan,
    isCurrent,
    onPurchase,
    onRenew,
    isLoading = false,
    isDisabled = false,
}) => {
    const { _id, planName, description, price, features, speedRate, devicesAllowed, tier } = plan;

    const handleAction = () => {
        if (isLoading || isDisabled) return;
        isCurrent ? onRenew(_id, planName, price) : onPurchase(_id, planName, price);
    };

    return (
        <div
            onClick={!isLoading && !isDisabled ? handleAction : undefined}
            className={`relative flex flex-col p-6 rounded-3xl shadow-xl border transition-all duration-300
        ${isLoading || isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-105"}
        ${isCurrent
                    ? "bg-gradient-to-r from-green-500 to-green-600 text-white"
                    : "bg-card dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                }`}
        >
            {/* Loading overlay */}
            {isLoading && (
                <div className="absolute inset-0 z-20 rounded-3xl bg-black/40 backdrop-blur flex flex-col items-center justify-center gap-2">
                    <Spinner />
                    <span className="text-white text-sm font-semibold">
                        Redirecting to payment…
                    </span>
                </div>
            )}

            {/* Current badge */}
            {isCurrent && (
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-white/20 text-xs flex items-center gap-1">
                    <CheckCircle size={14} /> Current
                </div>
            )}

            {/* Pro badge */}
            {!isCurrent && tier === "Pro" && (
                <div className="absolute top-4 left-4 flex items-center gap-1 bg-gradient-to-tr from-pink-500 to-purple-500 px-2 py-1 rounded-full text-white animate-bounce">
                    <TrendingUp size={16} /> Pro
                </div>
            )}

            {/* Header */}
            <div className="mb-4">
                <h3 className="text-2xl font-extrabold">{planName}</h3>
                {tier && !isCurrent && (
                    <span className="text-xs font-semibold bg-accent/20 text-accent px-2 py-0.5 rounded-full">
                        {tier}
                    </span>
                )}
                {description && <p className="text-sm mt-2">{description}</p>}
            </div>

            {/* Price */}
            <div className="my-4 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold">{`₦${price.toLocaleString()}`}</span>
                <span className="text-sm">{"/ month"}</span>
            </div>

            {/* Stats */}
            <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                    <Zap size={16} /> {speedRate} Mbps
                </div>
                <div className="flex items-center gap-2">
                    <Users size={16} /> {devicesAllowed} device(s)
                </div>
            </div>

            {/* Features */}
            {features?.length > 0 && (
                <ul className="mt-4 space-y-2">
                    {features.map((f, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                            <Star size={16} className={isCurrent ? "text-yellow-300" : ""} />
                            {f}
                        </li>
                    ))}
                </ul>
            )}

            {/* CTA button */}
            <button
                disabled={isLoading || isDisabled}
                onClick={(e) => {
                    e.stopPropagation();
                    handleAction();
                }}
                className={`mt-auto py-2 rounded-xl font-bold transition-all w-full
          ${isLoading || isDisabled
                        ? "bg-gray-400 cursor-not-allowed"
                        : isCurrent
                            ? "bg-white text-green-600 hover:bg-white/90"
                            : "bg-accent text-white hover:brightness-105"
                    }`}
            >
                {isLoading ? "Processing…" : isCurrent ? "Renew Plan" : "Select Plan"}
            </button>
        </div>
    );
};

export default SubscriptionCard;

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
            className={`relative flex flex-col p-6 rounded-2xl border transition-all duration-300
        ${isLoading || isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-105"}
        ${isCurrent ? "border-green-500" : "border-gray-300 dark:border-gray-700"}
      `}
        >
            {/* Loading overlay */}
            {isLoading && (
                <div className="absolute inset-0 z-20 rounded-2xl bg-black/30 backdrop-blur flex flex-col items-center justify-center gap-2">
                    <Spinner />
                    <span className="text-white text-sm font-semibold">Processing…</span>
                </div>
            )}

            {/* Current badge */}
            {isCurrent && (
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-green-500/20 text-green-700 text-xs font-semibold flex items-center gap-1">
                    <CheckCircle size={14} /> Current
                </div>
            )}

            {/* Header */}
            <div className="mb-4">
                <h3 className="text-xl font-bold">{planName}</h3>
                {tier && !isCurrent && (
                    <span className="text-xs font-semibold bg-accent/20 text-accent px-2 py-0.5 rounded-full">
                        {tier}
                    </span>
                )}
                {description && <p className="text-sm mt-1 text-muted-foreground">{description}</p>}
            </div>

            {/* Price */}
            <div className="my-3 flex items-baseline gap-1">
                <span className="text-2xl font-bold">{`₦${price.toLocaleString()}`}</span>
                <span className="text-sm text-muted-foreground">/ month</span>
            </div>

            {/* Stats */}
            <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                    <Zap size={16} /> {speedRate} Mbps
                </div>
                <div className="flex items-center gap-2">
                    <Users size={16} /> {devicesAllowed} device(s)
                </div>
            </div>

            {/* Features */}
            {features?.length > 0 && (
                <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                    {features.map((f, i) => (
                        <li key={i} className="flex items-center gap-2">
                            <Star size={16} className={isCurrent ? "text-yellow-400" : ""} />
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
                className={`mt-auto py-2 rounded-xl font-semibold w-full border transition-colors
          ${isLoading || isDisabled
                        ? "border-gray-400 text-gray-400 cursor-not-allowed"
                        : isCurrent
                            ? "border-green-500 text-green-500 hover:bg-green-50"
                            : "border-primary text-primary hover:bg-primary/10"
                    }`}
            >
                {isLoading ? "Processing…" : isCurrent ? "Renew Plan" : "Select Plan"}
            </button>
        </div>
    );
};

export default SubscriptionCard;

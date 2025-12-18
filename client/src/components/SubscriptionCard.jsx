import React from "react";
import { CheckCircle, Star, Zap, Users, TrendingUp } from "lucide-react";

const SubscriptionCard = ({ plan, isCurrent, onPurchase, onRenew }) => {
    const {
        _id,
        planName,
        description,
        price,
        features,
        speedRate,
        devicesAllowed,
        tier, // optional: e.g., "Basic", "Pro", "Enterprise"
    } = plan;

    const handleAction = () => {
        if (isCurrent) {
            onRenew(_id, planName, price);
        } else {
            onPurchase(_id, planName, price);
        }
    };

    // linear colors based on tier
    const tierlinear = {
        Basic: "from-blue-400 to-blue-600",
        Pro: "from-purple-500 to-pink-500",
        Enterprise: "from-yellow-400 to-orange-500",
    };

    return (
        <div
            onClick={handleAction}
            className={`relative flex flex-col justify-between p-6 rounded-3xl shadow-xl cursor-pointer transform transition-all duration-300 hover:scale-105 border border-transparent
                ${isCurrent ? "bg-linear-to-r from-green-400 to-green-600 text-white shadow-2xl"
                    : "bg-card dark:bg-gray-900 hover:shadow-2xl border-gray-200 dark:border-gray-700"}
            `}
        >
            {/* Animated Badge */}
            {isCurrent && (
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-white/20 backdrop-blur text-white text-xs font-bold flex items-center gap-1 animate-pulse">
                    <CheckCircle size={14} /> Current
                </div>
            )}

            {/* Header */}
            <div className="mb-4">
                <h3 className={`text-2xl font-extrabold ${isCurrent ? "text-white" : "text-primary dark:text-white"}`}>
                    {planName}
                </h3>
                {tier && <span className="inline-block mt-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-accent/20 text-accent">{tier}</span>}
                {description && (
                    <p className={`mt-2 text-sm ${isCurrent ? "text-white/80" : "text-secondary dark:text-gray-400"}`}>{description}</p>
                )}
            </div>

            {/* Price & Stats */}
            <div className="my-4 flex flex-col gap-3">
                <div className="flex items-baseline gap-2">
                    <span className={`text-4xl font-extrabold ${isCurrent ? "text-white" : "text-primary dark:text-white"}`}>₦{price.toLocaleString()}</span>
                    <span className={`text-sm ${isCurrent ? "text-white/70" : "text-secondary dark:text-gray-400"}`}>/ month</span>
                </div>
                <div className="flex flex-col gap-2 text-sm">
                    <div className={`flex items-center gap-1 ${isCurrent ? "text-white/80" : "text-secondary dark:text-gray-400"}`}>
                        <Zap size={16} className={`${isCurrent ? "text-white" : "text-accent"}`} /> {speedRate} Mbps
                    </div>
                    <div className={`flex items-center gap-1 ${isCurrent ? "text-white/80" : "text-secondary dark:text-gray-400"}`}>
                        <Users size={16} className={`${isCurrent ? "text-white" : "text-accent"}`} /> {devicesAllowed} device(s)
                    </div>
                </div>
            </div>

            {/* Features */}
            {features?.length > 0 && (
                <ul className="flex-1 mb-4 space-y-2">
                    {features.map((feature, idx) => (
                        <li key={idx} className={`flex items-center gap-2 text-sm ${isCurrent ? "text-white/90" : "text-secondary dark:text-gray-300"}`}>
                            <Star size={16} className={`${isCurrent ? "text-yellow-300" : "text-accent"}`} /> {feature}
                        </li>
                    ))}
                </ul>
            )}

            {/* CTA */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    handleAction();
                }}
                className={`w-full mt-auto py-2 rounded-xl font-bold shadow-lg transition-all 
                    ${isCurrent ? "bg-white text-primary hover:bg-white/90" : "bg-accent text-white hover:brightness-105"}
                `}
            >
                {isCurrent ? "Renew Plan" : "Select Plan"}
            </button>

            {/* Optional footer icon flair */}
            {!isCurrent && tier === "Pro" && (
                <div className="absolute top-4 left-4 p-1 rounded-full bg-linear-to-tr from-pink-500 to-purple-500 text-white animate-bounce">
                    <TrendingUp size={16} />
                </div>
            )}
        </div>
    );
};

export default SubscriptionCard;

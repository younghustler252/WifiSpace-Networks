"use client";

import PlanCard from "@/features/plan/PlanCard";

interface PlanSelectorProps {
    plans: any[];
    onSelect: (plan: any) => void;
    currentPlanId?: string;
    currentPlanPrice?: number;
}

export function HotspotPlanSelector({
    plans,
    onSelect,
    currentPlanId = "",
    currentPlanPrice = 0,
}: PlanSelectorProps) {
    // 🔥 FILTER THE PLANS: Remove lower tier configurations from the rendering pass entirely
    const visiblePlans = plans?.filter((plan) => {
        const isLowerTier = plan.price < currentPlanPrice;
        return !isLowerTier;
    }) ?? [];

    return (
        <div className="w-full">
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {visiblePlans.map((plan) => {
                    const planId = plan.id || plan._id;
                    const isCurrent = planId === currentPlanId;

                    return (
                        <PlanCard
                            key={planId}
                            plan={plan}
                            onSelect={onSelect}
                            isCurrent={isCurrent}
                        />
                    );
                })}
            </div>

            {visiblePlans.length === 0 && (
                <div className="ui-card text-center py-12">
                    <p className="text-muted-foreground">
                        No higher-tier upgrade plans are currently available for your account.
                    </p>
                </div>
            )}
        </div>
    );
}

"use client";

import PlanCard from "@/features/plan/PlanCard";

export function HotspotPlanSelector({
    plans,
    onSelect,
}: {
    plans: any[];
    onSelect: (plan: any) => void;
}) {
    return (
        <div className="w-full">

            <div className="
                grid
                gap-6
                md:grid-cols-2
                xl:grid-cols-3
            ">

                {plans?.map((plan) => (

                    <PlanCard
                        key={plan.id}
                        plan={plan}
                        onSelect={onSelect}
                    />

                ))}

            </div>


            {(!plans || plans.length === 0) && (

                <div className="
                    ui-card
                    text-center
                    py-12
                ">

                    <p className="
                        text-muted-foreground
                    ">
                        No hotspot plans are currently available.
                    </p>

                </div>

            )}

        </div>
    );
}
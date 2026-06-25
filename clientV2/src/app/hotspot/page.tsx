"use client";

import { useSearchParams } from "next/navigation";
import { HotspotRenderer } from "@/features/hotspot/HotspotRenderer";
import { useHotspotSession } from "@/features/hotspot/hooks/useHotspotSession";

function normalizeMac(mac?: string | null) {
    if (!mac) return undefined;

    try {
        return decodeURIComponent(
            decodeURIComponent(mac)
        );
    } catch {
        return mac;
    }
}

export default function HotspotPage() {
    const params = useSearchParams();

    const macAddress = normalizeMac(
        params.get("mac")
    );

    const ipAddress = params.get("ip") || undefined;

    const email =
        params.get("email") || "";

    const {
        state,
        session,
        plans,
        paymentResult,
        error,
        actions,
    } = useHotspotSession(
        macAddress,
        email,
        ipAddress
    );

    return (
        <HotspotRenderer
            state={state}
            session={session}
            plans={plans}
            paymentResult={paymentResult}
            error={error}
            actions={actions}
        />
    );
}
import React from "react";
import { Suspense } from "react";
import HotspotClient from "@/features/hotspot/hotspotClient";

export default function page() {
        return (
                <Suspense fallback={<div>Loading hotspot...</div>}>
                        <HotspotClient />
                </Suspense>
        );
}
import { Suspense } from "react";
import SuccessClient from "@/features/hotspot/HotspotSuccessClient";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
        <SuccessClient />
    </Suspense>
  );
}
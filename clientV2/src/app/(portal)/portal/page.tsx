import { Suspense } from "react";
import type { Metadata } from "next";
import { PortalFlow } from "@/features/hotspots/components/portal-flow";

export const metadata: Metadata = { title: "Get online" };

export default function PortalPage() {
	return (
		<Suspense>
			<PortalFlow />
		</Suspense>
	);
}
import type { Metadata } from "next";
import { PlansAdmin } from "@/features/plans/components/plans-admin";

export const metadata: Metadata = { title: "Plans" };

export default function AdminPlansPage() {
	return <PlansAdmin />;
}
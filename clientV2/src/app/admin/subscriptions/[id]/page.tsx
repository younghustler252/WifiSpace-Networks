import type { Metadata } from "next";
import { SubscriptionDetail } from "@/features/subscriptions/components/subscription-detail";

export const metadata: Metadata = { title: "Subscription" };

export default async function AdminSubscriptionPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	return <SubscriptionDetail id={id} />;
}
import type { Metadata } from "next";
import { SubscriptionsAdmin } from "@/features/subscriptions/components/subscriptions-admin";

export const metadata: Metadata = { title: "Subscriptions" };

export default function AdminSubscriptionPage() {
	return <SubscriptionsAdmin />;
}
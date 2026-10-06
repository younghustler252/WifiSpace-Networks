import { LinkedPaymentsCard } from "@/features/payments/components/linked-payments-card";

export function SubscriptionPaymentsCard({ subscriptionId }: { subscriptionId: string }) {
	return <LinkedPaymentsCard params={{ subscriptionId }} />;
}
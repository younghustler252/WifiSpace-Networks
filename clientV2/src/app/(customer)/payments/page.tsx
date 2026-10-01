import type { Metadata } from "next";
import { PaymentsList } from "@/features/payments/components/payments-list";

export const metadata: Metadata = { title: "Payments" };

export default function PaymentsPage() {
	return <PaymentsList />;
}
import type { Metadata } from "next";
import { PaymentsAdmin } from "@/features/payments/components/payments-admin";

export const metadata: Metadata = { title: "Payments" };

export default function AdminPaymentsPage() {
	return <PaymentsAdmin />;
}
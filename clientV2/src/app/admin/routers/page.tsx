import type { Metadata } from "next";
import { RoutersAdmin } from "@/features/routers/components/routers-admin";

export const metadata: Metadata = { title: "Routers" };

export default function AdminRoutersPage() {
	return <RoutersAdmin />;
}
import type { Metadata } from "next";
import { NetworkAdmin } from "@/features/network/components/network-admin";

export const metadata: Metadata = { title: "Network config" };

export default function AdminNetworkPage() {
	return <NetworkAdmin />;
}

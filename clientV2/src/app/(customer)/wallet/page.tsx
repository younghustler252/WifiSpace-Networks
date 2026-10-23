import type { Metadata } from "next";
import { WalletView } from "@/features/wallet/components/wallet-view";

export const metadata: Metadata = { title: "Wallet" };

export default function WalletPage() {
	return <WalletView />;
}

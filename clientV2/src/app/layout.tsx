import type { Metadata } from "next";
import { Fira_Mono, Inter } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const firaMono = Fira_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-fira-mono" });

export const metadata: Metadata = {
	title: { default: "WifiSpace", template: "%s · WifiSpace" },
	description: "Fast, reliable internet plans from WifiSpace.",
};
export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html
			lang="en"
			suppressHydrationWarning
			className={`${inter.variable} ${firaMono.variable} dark`}
		>
			<body className="font-sans">
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}

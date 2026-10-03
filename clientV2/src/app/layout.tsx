import type { Metadata, Viewport } from "next";
import { Fira_Mono, Inter } from "next/font/google";
import { company } from "@/config/company";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const firaMono = Fira_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-fira-mono" });

export const metadata: Metadata = {
	metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
	title: { default: `${company.name} · ${company.tagline}`, template: `%s · ${company.name}` },
	description: company.description,
	applicationName: company.name,
	openGraph: {
		title: company.name,
		description: company.description,
		siteName: company.name,
		type: "website",
	},
};

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	viewportFit: "cover",
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "#ffffff" },
		{ media: "(prefers-color-scheme: dark)", color: "#111827" },
	],
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

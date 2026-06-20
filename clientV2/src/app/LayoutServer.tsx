// src/app/LayoutServer.tsx
import type { Metadata } from "next";
import { Inter, Fira_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-inter",
  display: "swap",
});

const firaMono = Fira_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-fira-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Wifispace Networks",
  description: "Manage your network efficiently",
  icons: {
    icon: "/wifispace.png",
    shortcut: "/wifispace.png",
    apple: "/wifispace.png",
  },
};

export default function LayoutServer({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${firaMono.variable} font-inter antialiased`}>
        {children}
      </body>
    </html>
  );
}
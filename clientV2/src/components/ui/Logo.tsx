"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/cn";

interface LogoProps {
	size?: "sm" | "md" | "lg";
	showText?: boolean;
	className?: string;
}

const sizeMap = {
	sm: {
		icon: 28,
		text: "text-base",
	},
	md: {
		icon: 36,
		text: "text-lg",
	},
	lg: {
		icon: 100,
		text: "text-xl",
	},
};

const Logo = ({ size = "md", showText = true, className }: LogoProps) => {
	const styles = sizeMap[size];

	return (
		<div className={cn("flex items-center gap-2", className)}>
			{/* LOGO IMAGE */}
			<img
				src="/wifispace.png"
				alt="Wifispace Networks"
				width={styles.icon}
				height={styles.icon}
			/>

			{/* BRAND TEXT */}
			{showText && (
				<span className={cn("font-bold tracking-tight text-primary", styles.text)}>
					Wifispace Networks
				</span>
			)}
		</div>
	);
};

export default Logo;
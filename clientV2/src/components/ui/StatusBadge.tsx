"use client";

import React from "react";

interface StatusBadgeProps {
	children: React.ReactNode;
	variant?: "default" | "success" | "warning" | "danger" | "info";
	size?: "sm" | "md";
	solid?: boolean;
	withDot?: boolean;
	className?: string;
}

const StatusBadge = ({
	children,
	variant = "default",
	size = "md",
	solid = false,
	withDot = false,
	className = "",
}: StatusBadgeProps) => {

	// Clean, standard Tailwind primitives instead of string literals
	const baseStyles = "inline-flex items-center justify-center font-semibold tracking-wide select-none whitespace-nowrap align-middle transition-colors";

	// Replaced system dependencies like "ui-badge-success" with pure Tailwind tokens
	const variantStyles = {
		default: solid
			? "bg-secondary text-secondary-foreground"
			: "bg-secondary/50 text-muted-foreground border border-border/40",

		success: solid
			? "bg-emerald-600 text-white"
			: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",

		warning: solid
			? "bg-amber-500 text-black"
			: "bg-amber-500/10 text-amber-600 dark:text-amber-400",

		danger: solid
			? "bg-destructive text-destructive-foreground"
			: "bg-destructive/10 text-destructive",

		info: solid
			? "bg-blue-600 text-white"
			: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
	};

	// Pro-tier badges use smaller text with slightly more horizontal breathability
	const sizeStyles = {
		sm: "px-2 py-0.5 text-[10px] uppercase tracking-wider rounded-md gap-1",
		md: "px-2.5 py-0.5 text-xs rounded-full gap-1.5", // Swapped md to rounded-full for a sleek modern capsule look
	};

	return (
		<span
			className={`
				${baseStyles}
				${variantStyles[variant]}
				${sizeStyles[size]}
				${className}
			`}
		>
			{withDot && (
				<span
					className={`
						w-1.5 h-1.5 rounded-full shrink-0
						${solid ? "bg-white" : "bg-current opacity-80"}
					`}
				/>
			)}
			{children}
		</span>
	);
};

export default StatusBadge;

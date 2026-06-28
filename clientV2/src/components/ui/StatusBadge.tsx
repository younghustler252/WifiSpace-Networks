"use client";

import React from "react";

interface StatusBadgeProps {
	children: React.ReactNode;
	variant?: "successful" | "pending" | "failed" | "initiated" | "expired" | string;
	size?: "sm" | "md";
	withDot?: boolean;
	className?: string;
}

const StatusBadge = ({
	children,
	variant = "pending",
	size = "md",
	withDot = false,
	className = "",
}: StatusBadgeProps) => {

	const baseStyles = "inline-flex items-center justify-center font-semibold tracking-wide select-none whitespace-nowrap align-middle transition-colors";

	let statusClass = "";

	switch (variant) {
		case "successful":
			statusClass = "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400";
			break;
		case "pending":
		case "initiated":
			statusClass = "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400";
			break;
		case "failed":
		case "expired":
			statusClass = "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400";
			break;
		default:
			statusClass = "bg-gray-100 text-gray-700 dark:bg-neutral-800 dark:text-neutral-400";
			break;
	}

	const sizeClass = size === "sm"
		? "px-2 py-0.5 text-[10px] uppercase tracking-wider rounded-md gap-1"
		: "px-2.5 py-0.5 text-xs rounded-full gap-1.5";

	return (
		<span className={`${baseStyles} ${statusClass} ${sizeClass} ${className}`}>
			{withDot && (
				<span className="w-1.5 h-1.5 rounded-full shrink-0 bg-current opacity-80" />
			)}
			{children}
		</span>
	);
};

export default StatusBadge;

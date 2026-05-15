"use client";

import React from "react";

interface StatusBadgeProps {
	children: React.ReactNode;
	variant?:
		| "default"
		| "success"
		| "warning"
		| "danger"
		| "info";
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

	/* -------------------------
		Base Styles
	-------------------------- */

	const baseStyles = "ui-badge";

	/* -------------------------
		Variant Styles
	-------------------------- */

	const variantStyles = {
		default: solid
			? "bg-muted text-foreground"
			: "bg-muted text-muted-foreground",

		success: solid
			? "bg-success text-white"
			: "ui-badge-success",

		warning: solid
			? "bg-warning text-white"
			: "bg-warning/10 text-warning",

		danger: solid
			? "bg-danger text-white"
			: "ui-badge-danger",

		info: solid
			? "bg-accent text-accent-foreground"
			: "bg-accent/10 text-accent",
	};

	/* -------------------------
		Size Styles
	-------------------------- */

	const sizeStyles = {
		sm: "px-2 py-0.5 text-[11px] rounded-md",
		md: "px-2.5 py-1 text-xs rounded-lg",
	};

	return (
		<span
			className={`
				${baseStyles}
				inline-flex items-center gap-1.5
				font-medium whitespace-nowrap
				${variantStyles[variant]}
				${sizeStyles[size]}
				${className}
			`}
		>
			{withDot && (
				<span
					className={`
						w-1.5 h-1.5 rounded-full
						${solid ? "bg-white/80" : "bg-current"}
					`}
				/>
			)}

			{children}
		</span>
	);
};

export default StatusBadge;
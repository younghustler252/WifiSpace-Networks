"use client";

import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
	children: React.ReactNode;
	className?: string;
	padding?: "none" | "sm" | "md" | "lg";
	hover?: boolean;
}

const Card = ({
	children,
	className = "",
	padding = "md",
	hover = true,
	...props
}: CardProps) => {
	const paddingStyles = {
		none: "",
		sm: "p-4",
		md: "p-6",
		lg: "p-8",
	};

	return (
		<div
			{...props}
			className={`
				ui-card
				transition-all
				${hover ? "hover:shadow-md hover:-translate-y-[1px]" : ""}
				${paddingStyles[padding]}
				${className}
			`}
		>
			{children}
		</div>
	);
};

export default Card;

/* -------------------------
	Sub Components
-------------------------- */

interface SectionProps {
	children: React.ReactNode;
	className?: string;
}

export const CardHeader = ({
	children,
	className = "",
}: SectionProps) => {
	return (
		<div
			className={`
				ui-card-header
				flex items-center justify-between
				${className}
			`}
		>
			{children}
		</div>
	);
};

export const CardContent = ({
	children,
	className = "",
}: SectionProps) => {
	return (
		<div
			className={`
				ui-card-body
				${className}
			`}
		>
			{children}
		</div>
	);
};

export const CardFooter = ({
	children,
	className = "",
}: SectionProps) => {
	return (
		<div
			className={`
				ui-card-footer
				${className}
			`}
		>
			{children}
		</div>
	);
};
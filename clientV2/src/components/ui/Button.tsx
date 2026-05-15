"use client";

import { Spinner } from "./Loader";
import React from "react";
import clsx from "clsx";

interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: "primary" | "accent" | "outline" | "ghost" | "danger" | "soft";
	size?: "sm" | "md" | "lg";
	isLoading?: boolean;
	leftIcon?: React.ReactNode;
	rightIcon?: React.ReactNode;
	fullWidth?: boolean;
}

const Button = ({
	children,
	className,
	variant = "accent",
	size = "md",
	isLoading = false,
	leftIcon,
	rightIcon,
	fullWidth = false,
	disabled,
	...props
}: ButtonProps) => {

	const variants = {
		primary: `
			bg-primary
			text-primary-foreground
			hover:opacity-90
			shadow-lg shadow-black/5
		`,

		accent: `
			bg-accent
			text-white
			hover:bg-[rgb(var(--accent-hover))]
			shadow-lg shadow-accent/20
			hover:shadow-accent/30
		`,

		soft: `
			bg-accent-soft
			text-accent
			hover:bg-accent/15
		`,

		outline: `
			border border-border
			bg-background/80
			backdrop-blur-sm
			hover:bg-muted
		`,

		ghost: `
			bg-transparent
			hover:bg-muted
		`,

		danger: `
			bg-danger
			text-white
			hover:opacity-90
			shadow-lg shadow-danger/20
		`,
	};

	const sizes = {
		sm: "h-9 px-4 text-sm rounded-xl",
		md: "h-11 px-5 text-sm rounded-xl",
		lg: "h-13 px-7 text-base rounded-2xl",
	};

	return (
		<button
			disabled={disabled || isLoading}
			className={clsx(
				`
				inline-flex items-center justify-center gap-2
				font-medium
				transition-all duration-200
				active:scale-[0.98]
				disabled:opacity-50
				disabled:pointer-events-none
				select-none
				whitespace-nowrap
				`,
				variants[variant],
				sizes[size],
				fullWidth && "w-full",
				className
			)}
			{...props}
		>
			{isLoading ? (
				<>
					<Spinner />
					<span>Loading...</span>
				</>
			) : (
				<>
					{leftIcon}
					{children}
					{rightIcon}
				</>
			)}
		</button>
	);
};

export default Button;
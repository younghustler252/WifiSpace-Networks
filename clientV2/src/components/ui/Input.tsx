"use client";

import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	error?: boolean;
	leftIcon?: React.ReactNode;
	rightIcon?: React.ReactNode;
}

export const Input = ({
	className = "",
	error = false,
	leftIcon,
	rightIcon,
	...props
}: InputProps) => {
	return (
		<div className="relative w-full">

			{/* Left Icon */}
			{leftIcon && (
				<div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
					{leftIcon}
				</div>
			)}

			{/* Input Field */}
			<input
				className={`
					w-full
					h-11
					rounded-lg
					bg-muted
					border
					${error
						? "border-danger focus:ring-danger/30 focus:border-danger"
						: "border-border focus:border-primary focus:ring-primary/40"
					}
					text-sm
					px-4
					${leftIcon ? "pl-10" : ""}
					${rightIcon ? "pr-10" : ""}
					placeholder:text-muted-foreground
					focus:outline-none
					focus:ring-2
					transition-all
					${className}
				`}
				{...props}
			/>

			{/* Right Icon */}
			{rightIcon && (
				<div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
					{rightIcon}
				</div>
			)}

		</div>
	);
};
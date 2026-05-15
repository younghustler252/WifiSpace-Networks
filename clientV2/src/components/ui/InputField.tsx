"use client";

import React from "react";
import { Input } from "./Input";

interface InputFieldProps 
	extends React.InputHTMLAttributes<HTMLInputElement> {
	label: string;
	name?: string;
	helperText?: string;
	errorMessage?: string;
	required?: boolean;
	leftIcon?: React.ReactNode;
	rightIcon?: React.ReactNode;
}

export const InputField = ({
	label,
	helperText,
	errorMessage,
	required,
	leftIcon,
	rightIcon,
	...props
}: InputFieldProps) => {

	const hasError = Boolean(errorMessage);

	return (
		<div className="flex flex-col gap-2 w-full">

			<label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
				{label}
				{required && (
					<span className="text-danger ml-1">*</span>
				)}
			</label>

			<Input
				error={hasError}
				leftIcon={leftIcon}
				rightIcon={rightIcon}
				{...props}
			/>

			{hasError ? (
				<p className="text-xs text-danger font-medium">
					{errorMessage}
				</p>
			) : helperText ? (
				<p className="text-xs text-muted-foreground">
					{helperText}
				</p>
			) : null}

		</div>
	);
};
"use client";

import React from "react";
import Logo from "./Logo";

/* ------------------------------
	Spinner Component
------------------------------ */
interface SpinnerProps {
	size?: "sm" | "md" | "lg";
	className?: string;
}

export const Spinner = ({
	size = "md",
	className = "",
}: SpinnerProps) => {
	const sizeStyles = {
		sm: "w-4 h-4 border-2",
		md: "w-6 h-6 border-2",
		lg: "w-10 h-10 border-4",
	};

	return (
		<div
			className={`
				animate-spin
				rounded-full
				border-muted
				border-t-accent
				${sizeStyles[size]}
				${className}
			`}
		/>
	);
};

/* ------------------------------
	Centered Loader (inside container)
------------------------------ */
interface CenterLoaderProps {
	label?: string;
}

export const CenterLoader = ({ label }: CenterLoaderProps) => {
	return (
		<div className="flex flex-col items-center justify-center gap-4 py-10">
			<Spinner size="lg" />
			{label && (
				<p className="text-sm text-muted-foreground">
					{label}
				</p>
			)}
		</div>
	);
};

/* ------------------------------
	Fullscreen Loader (logo pulse)
------------------------------ */
interface FullScreenLoaderProps {
	label?: string;
}

export const FullScreenLoader = ({ label }: FullScreenLoaderProps) => {
	return (
		<div className="
			fixed
			inset-0
			bg-background
			flex
			items-center
			justify-center
			z-50
		">
			<div className="flex flex-col items-center gap-4">
				<div className="animate-heartbeat">
					<Logo size="lg" showText={false} />
				</div>
				{label && (
					<p className="text-sm text-muted-foreground">
						{label}
					</p>
				)}
			</div>
		</div>
	);
};

/* ------------------------------
	Overlay Loader (blurred background)
------------------------------ */
interface OverlayLoaderProps {
	label?: string;
}

export const OverlayLoader = ({ label }: OverlayLoaderProps) => {
	return (
		<div className="
			absolute
			inset-0
			bg-background/70
			backdrop-blur-sm
			flex
			items-center
			justify-center
			z-40
		">
			<div className="flex flex-col items-center gap-4">
				<Spinner size="lg" />
				{label && (
					<p className="text-sm text-muted-foreground">
						{label}
					</p>
				)}
			</div>
		</div>
	);
};
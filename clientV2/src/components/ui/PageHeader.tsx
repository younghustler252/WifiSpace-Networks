"use client";

import React from "react";
import { cn } from "@/lib/cn";

interface PageHeaderProps {
	title: string;
	subtitle?: string;
	actions?: React.ReactNode;
	backButton?: React.ReactNode;
	className?: string;
}

const PageHeader = ({
	title,
	subtitle,
	actions,
	backButton,
	className = "",
}: PageHeaderProps) => {
	return (
		<div
			className={cn(
				"flex flex-col md:flex-row md:items-center md:justify-between",
				"gap-4 md:gap-6",
				"px-6 pt-6 pb-4",
				"border-b border-border/60",
				className
			)}
		>
			{/* LEFT */}
			<div className="flex items-start gap-3 min-w-0">
				{/* Optional Back Button */}
				{backButton && (
					<div className="flex-shrink-0 pt-0.5">
						{backButton}
					</div>
				)}

				<div className="flex flex-col gap-1.5 min-w-0">
					<h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground truncate">
						{title}
					</h1>

					{subtitle && (
						<p className="text-sm text-muted-foreground max-w-xl">
							{subtitle}
						</p>
					)}
				</div>
			</div>

			{/* RIGHT (Actions) */}
			{actions && (
				<div className="flex items-center gap-2 md:gap-3 flex-wrap flex-shrink-0">
					{actions}
				</div>
			)}
		</div>
	);
};

export default PageHeader;
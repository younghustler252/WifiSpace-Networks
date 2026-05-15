"use client";

import React from "react";
import Card from "@/components/ui/Card";

interface StatCardProps {
	title: string;
	value: string | number;
	icon?: React.ReactNode;
	trend?: number; // positive or negative
	description?: string;
}

const StatCard = ({
	title,
	value,
	icon,
	trend,
	description,
}: StatCardProps) => {

	const isPositive = trend !== undefined && trend >= 0;

	return (
		<Card padding="md" className="relative">
			<div className="flex items-start justify-between gap-4">

				{/* Left Content */}
				<div className="flex flex-col gap-2">

					<p className="text-sm font-medium text-muted-foreground">
						{title}
					</p>

					<h3 className="text-3xl font-bold tracking-tight text-foreground">
						{value}
					</h3>

					{trend !== undefined && (
						<p className={`text-xs font-semibold ${isPositive ? "text-success" : "text-danger"}`}>
							{isPositive ? "▲" : "▼"} {Math.abs(trend)}%
							<span className="ml-1 text-muted-foreground font-normal">
								from last month
							</span>
						</p>
					)}

					{description && (
						<p className="text-xs text-muted-foreground">
							{description}
						</p>
					)}

				</div>

				{/* Icon */}
				{icon && (
					<div className="
						w-12
						h-12
						rounded-2xl
						bg-accent/10
						text-accent
						flex
						items-center
						justify-center
					">
						{icon}
					</div>
				)}

			</div>
		</Card>
	);
};

export default StatCard;
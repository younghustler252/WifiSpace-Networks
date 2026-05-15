"use client";

import React, { useState } from "react";
import { cn } from "@/lib/cn";

interface AvatarProps {
	name?: string;
	src?: string;
	size?: "sm" | "md" | "lg";
	className?: string;
}

const Avatar = ({
	name,
	src,
	size = "md",
	className = "",
}: AvatarProps) => {

	const [imgError, setImgError] = useState(false);

	const sizeMap = {
		sm: "w-8 h-8 text-xs",
		md: "w-10 h-10 text-sm",
		lg: "w-14 h-14 text-base",
	};

	const initials =
		name
			?.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase() || "?";

	const showImage = src && !imgError;

	return (
		<div
			className={cn(
				"rounded-full bg-muted text-foreground flex items-center justify-center font-semibold overflow-hidden",
				"hover:ring-2 hover:ring-accent/50 transition-all",
				sizeMap[size],
				className
			)}
		>
			{showImage ? (
				<img
					src={src}
					alt={name || "User avatar"}
					className="w-full h-full object-cover"
					onError={() => setImgError(true)} // 🔥 fallback trigger
				/>
			) : (
				initials
			)}
		</div>
	);
};

export default Avatar;
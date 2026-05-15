"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/cn";

interface DropdownProps {
	trigger: React.ReactNode;
	children: React.ReactNode;
	align?: "left" | "right";
	className?: string;
}

const Dropdown = ({
	trigger,
	children,
	align = "right",
	className = "",
}: DropdownProps) => {
	const [open, setOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (ref.current && !ref.current.contains(event.target as Node)) {
				setOpen(false);
			}
		};

		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				setOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		document.addEventListener("keydown", handleEscape);

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("keydown", handleEscape);
		};
	}, []);

	return (
		<div
			ref={ref}
			className={cn("relative inline-block", className)}
		>
			<div
				onClick={() => setOpen((prev) => !prev)}
				className="cursor-pointer"
			>
				{trigger}
			</div>

			{open && (
				<div
					className={cn(
						"absolute z-50 mt-2 min-w-[220px]",
						"ui-card p-2",
						"animate-in fade-in zoom-in-95 duration-150",
						align === "right" ? "right-0" : "left-0"
					)}
				>
					{children}
				</div>
			)}
		</div>
	);
};

export default Dropdown;

/* =============================
	Dropdown Item
============================= */

interface DropdownItemProps {
	children: React.ReactNode;
	onClick?: () => void;
	danger?: boolean;
}

export const DropdownItem = ({
	children,
	onClick,
	danger = false,
}: DropdownItemProps) => {
	return (
		<button
			onClick={onClick}
			className={cn(
				"w-full text-left px-3 py-2 rounded-md text-sm transition-all",
				"hover:bg-muted",
				"focus:outline-none focus:bg-muted",
				danger
					? "text-danger hover:bg-danger/10"
					: "text-foreground"
			)}
		>
			{children}
		</button>
	);
};

export const DropdownDivider = () => {
	return <div className="my-1 h-px bg-border" />;
};
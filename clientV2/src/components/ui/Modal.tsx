"use client";

import React, { useEffect } from "react";
import { cn } from "@/lib/cn";
import { X } from "lucide-react";

import Button from "@/components/ui/Button";

/* =====================================================
	Root Modal
===================================================== */

interface ModalProps {
	open: boolean;
	onClose: () => void;
	children: React.ReactNode;
	size?: "sm" | "md" | "lg" | "xl";
	className?: string;
}

const Modal = ({
	open,
	onClose,
	children,
	size = "md",
	className = "",
}: ModalProps) => {
	/* -------------------------
		Prevent Body Scroll
	-------------------------- */
	useEffect(() => {
		document.body.style.overflow = open ? "hidden" : "auto";

		return () => {
			document.body.style.overflow = "auto";
		};
	}, [open]);

	/* -------------------------
		ESC to Close
	-------------------------- */
	useEffect(() => {
		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape") onClose();
		};

		if (open) document.addEventListener("keydown", handleEscape);

		return () => {
			document.removeEventListener("keydown", handleEscape);
		};
	}, [open, onClose]);

	if (!open) return null;

	const sizeStyles = {
		sm: "max-w-md",
		md: "max-w-lg",
		lg: "max-w-2xl",
		xl: "max-w-4xl",
	};

	return (
		<div className={cn("fixed inset-0 flex items-center justify-center z-50", className)}>
			
			{/* Overlay */}
			<div
				className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150"
				onClick={onClose}
			/>

			{/* Modal Panel */}
			<div
				className={cn(
					"relative w-full mx-4",
					"ui-card",
					"animate-in zoom-in-95 fade-in duration-150",
					"max-h-[90vh] flex flex-col overflow-hidden",
					sizeStyles[size],
					className
				)}
			>
				{React.Children.map(children, (child) => {
					if (React.isValidElement(child)) {
						return React.cloneElement(child as any, { onClose });
					}
					return child;
				})}
			</div>
		</div>
	);
};

export default Modal;

/* =====================================================
	Modal Sections
===================================================== */

interface SectionProps {
	children: React.ReactNode;
	className?: string;
	onClose?: () => void;
}

/* ---------------- HEADER ---------------- */

export const ModalHeader = ({
	children,
	className = "",
	onClose,
}: SectionProps) => {
	return (
		<div
			className={cn(
				"px-6 py-4 border-b border-border",
				"flex items-center justify-between",
				"font-semibold",
				className
			)}
		>
			<div>{children}</div>

			<Button
				variant="ghost"
				size="sm"
				onClick={() => onClose?.()}
				className="p-2"
			>
				<X className="w-4 h-4" />
			</Button>
		</div>
	);
};

/* ---------------- BODY ---------------- */

export const ModalBody = ({
	children,
	className = "",
}: SectionProps) => {
	return (
		<div
			className={cn(
				"px-6 py-5 text-sm text-muted-foreground",
				"flex-1 overflow-y-auto ui-scrollbar",
				className
			)}
		>
			{children}
		</div>
	);
};

/* ---------------- FOOTER ---------------- */

export const ModalFooter = ({
	children,
	className = "",
}: SectionProps) => {
	return (
		<div
			className={cn(
				"px-6 py-4 border-t border-border",
				"flex items-center justify-end gap-2",
				className
			)}
		>
			{children}
		</div>
	);
};
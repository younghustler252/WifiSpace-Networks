"use client";

import React, { useState } from "react";
import { SlidersHorizontal } from "lucide-react"; // Swapped Funnel for a cleaner modern icon

import Modal, { ModalHeader, ModalBody, ModalFooter } from "./Modal";
import Button from "./Button";
import { cn } from "@/lib/cn";

interface TableToolbarProps {
	primary?: React.ReactNode;
	secondary?: React.ReactNode;
	right?: React.ReactNode;
	mobile?: React.ReactNode;
	title?: string;
	loading?: boolean;
	className?: string;
}

export default function TableToolbar({
	primary,
	secondary,
	right,
	mobile,
	title = "Filters",
	loading = false,
	className = "",
}: TableToolbarProps) {
	const [open, setOpen] = useState(false);

	return (
		// 📱 Core Mobile Fix: Changed from absolute flex to flex-col on small viewports, changing back to row on lg devices
		<div className={cn("ui-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4", className)}>

			{/* ================= PRIMARY CONTENT AREA ================= */}
			<div className="flex items-center gap-3 w-full sm:w-auto flex-1 min-w-0">
				{/* Wrapped primary elements to stretch smoothly across small screens */}
				<div className="w-full [&>input]:w-full [&>div]:w-full">
					{primary}
				</div>
			</div>

			{/* ================= SECONDARY ACTIONS ROW ================= */}
			<div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto shrink-0">
				
				{/* Desktop Filters (Kept safely hidden on mobile) */}
				<div className="hidden lg:flex items-center gap-3">
					{secondary}
				</div>

				{/* Mobile Filter Sheet Button Trigger */}
				<div className="flex lg:hidden items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => setOpen(true)}
						className="gap-2 text-xs"
					>
						<SlidersHorizontal size={14} />
						<span>Filters</span>
					</Button>

					{loading && (
						<span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
					)}
				</div>

				{/* Primary Structural CTA Blocks (e.g., Create, Export, Refresh) */}
				<div className="flex items-center gap-3 shrink-0">
					{right}
				</div>
			</div>

			{/* ================= MOBILE BOTTOM SHEET SHEET DRAWERS ================= */}
			<Modal open={open} onClose={() => setOpen(false)} size="sm">
				<ModalHeader>
					<span className="text-sm tracking-tight font-semibold text-foreground">{title}</span>
				</ModalHeader>

				<ModalBody>
					{/* Grid format stack to make inputs look pristine when stacked up inside the layout drawer */}
					<div className="flex flex-col gap-4 py-2 [&_label]:text-xs [&_label]:font-medium [&_label]:text-muted-foreground">
						{mobile || secondary}
					</div>
				</ModalBody>

				{/* Formally integrated with your native Modal footer primitive configuration layers */}
				<ModalFooter>
					<Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => setOpen(false)}>
						Cancel
					</Button>
					<Button variant="accent" size="sm" className="w-full sm:w-auto" onClick={() => setOpen(false)}>
						Apply Filters
					</Button>
				</ModalFooter>
			</Modal>
		</div>
	);
}

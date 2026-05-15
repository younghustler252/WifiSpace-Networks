"use client";

import React, { useState } from "react";
import { Funnel, Search } from "lucide-react";

import Modal, { ModalHeader, ModalBody } from "./Modal";
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
		<div className={cn("ui-card flex items-center gap-3", className)}>

			{/* ================= LEFT (PRIMARY ALWAYS VISIBLE) ================= */}
			<div className="flex items-center gap-3 flex-1 min-w-0">
				{primary}
			</div>

			{/* ================= DESKTOP SECONDARY ================= */}
			<div className="hidden lg:flex items-center gap-3">
				{secondary}
			</div>

			{/* ================= MOBILE / COLLAPSE BUTTON ================= */}
			<div className="flex lg:hidden items-center gap-2">

				<Button
					variant="outline"
					size="sm"
					onClick={() => setOpen(true)}
				>
					<Funnel size={16} />
				</Button>

				{loading && (
					<span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
				)}
			</div>

			{/* ================= RIGHT ACTIONS ================= */}
			<div className="flex items-center gap-3 ml-auto shrink-0">
				{right}
			</div>

			{/* ================= MOBILE MODAL ================= */}
			<Modal open={open} onClose={() => setOpen(false)} size="sm">
				<ModalHeader>
					<h2 className="text-base font-semibold">{title}</h2>
				</ModalHeader>

				<ModalBody>
					<div className="flex flex-col gap-4">
						{mobile || secondary}
					</div>
				</ModalBody>

				<div className="p-4 flex justify-end gap-2 border-t border-border">
					<Button variant="ghost" onClick={() => setOpen(false)}>
						Close
					</Button>

					<Button variant="accent" onClick={() => setOpen(false)}>
						Apply
					</Button>
				</div>
			</Modal>
		</div>
	);
}
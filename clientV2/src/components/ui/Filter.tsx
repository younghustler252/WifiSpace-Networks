"use client";

import React, { useState } from "react";
import { cn } from "@/lib/cn";
import Modal, { ModalHeader, ModalBody, ModalFooter } from "./Modal";
import Button from "./Button";
import { Funnel } from "lucide-react"; // Filter icon

interface FilterProps {
	children: React.ReactNode; // Actual filter controls
	title?: string;           // Label for modal on mobile
	className?: string;
}

const Filter = ({
	children,
	title = "Filters",
	className = "",
}: FilterProps) => {

	const [mobileOpen, setMobileOpen] = useState(false);

	return (
		<div className={cn("flex items-center gap-2", className)}>

			{/* Desktop Inline Filters */}
			<div className="hidden sm:flex gap-2">
				{children}
			</div>

			{/* Mobile Icon Button */}
			<div className="flex sm:hidden">
				<Button
					variant="outline"
					size="sm"
					onClick={() => setMobileOpen(true)}
					aria-label="Open filters"
				>
					<Funnel size={16} />
				</Button>
			</div>

			{/* Mobile Modal */}
			<Modal
				open={mobileOpen}
				onClose={() => setMobileOpen(false)}
				size="sm"
			>
				<ModalHeader>
					<h2 className="text-lg font-semibold">{title}</h2>
				</ModalHeader>

				<ModalBody className="flex flex-col gap-4">
					{children}
				</ModalBody>

				<ModalFooter>
					<Button
						variant="ghost"
						onClick={() => setMobileOpen(false)}
					>
						Cancel
					</Button>
					<Button onClick={() => setMobileOpen(false)}>
						Apply
					</Button>
				</ModalFooter>
			</Modal>

		</div>
	);
};

export default Filter;
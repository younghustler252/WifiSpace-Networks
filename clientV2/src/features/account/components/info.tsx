"use client";

import { useState } from "react";

type InfoProps = {
	label: string;
	value?: string;
	icon?: React.ReactNode;
	editable?: boolean;
	onChange?: (value: string) => void;
};

const Info = ({ label, value, icon, editable = false, onChange }: InfoProps) => {
	const [localValue, setLocalValue] = useState(value || "");

	const isEmpty = !value;

	return (
		<div className="min-w-0">

			{/* LABEL */}
			<label className="text-[11px] text-muted-foreground uppercase tracking-wide">
				{label}
			</label>

			{/* VALUE */}
			<div className="mt-1 flex items-center gap-2 min-w-0">

				{icon && (
					<span className="text-muted-foreground flex-shrink-0">
						{icon}
					</span>
				)}

				{/* EDIT MODE */}
				{editable ? (
					<input
						value={localValue}
						onChange={(e) => {
							setLocalValue(e.target.value);
							onChange?.(e.target.value);
						}}
						className="w-full bg-transparent border border-border rounded-md px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-accent"
					/>
				) : (
					<p className="text-sm font-medium truncate min-w-0 text-foreground">
						{value || "—"}
					</p>
				)}

			</div>
		</div>
	);
};

export default Info;
"use client";

import { useState, useEffect } from "react";

type Option = {
	label: string;
	value: string;
};

type InfoProps = {
	label: string;
	value?: string;
	icon?: React.ReactNode;
	editable?: boolean;
	onChange?: (value: string) => void;
	type?: "text" | "select"; // ✅ Support select inputs
	options?: Option[];      // ✅ Select choices
};

const Info = ({ 
	label, 
	value, 
	icon, 
	editable = false, 
	onChange,
	type = "text",
	options = []
}: InfoProps) => {
	const [localValue, setLocalValue] = useState(value || "");

	// ✅ Sync state if parent variables switch outside components
	useEffect(() => {
		setLocalValue(value || "");
	}, [value]);

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
					type === "select" ? (
						// ✅ Render a native styled select drop-down block
						<select
							value={localValue}
							onChange={(e) => {
								setLocalValue(e.target.value);
								onChange?.(e.target.value);
							}}
							className="w-full bg-card border border-border rounded-md px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-accent cursor-pointer"
						>
							{options.map((opt) => (
								<option key={opt.value} value={opt.value}>
									{opt.label}
								</option>
							))}
						</select>
					) : (
						<input
							value={localValue}
							onChange={(e) => {
								setLocalValue(e.target.value);
								onChange?.(e.target.value);
							}}
							className="w-full bg-transparent border border-border rounded-md px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-accent"
						/>
					)
				) : (
					<p className="text-sm font-medium truncate min-w-0 text-foreground">
						{/* ✅ Map raw values (like "pppoe") back to friendly labels when not editing */}
						{type === "select" && options.length > 0
							? options.find((opt) => opt.value === value)?.label || value || "—"
							: value || "—"}
					</p>
				)}
			</div>
		</div>
	);
};

export default Info;

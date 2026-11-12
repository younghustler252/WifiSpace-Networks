"use client";

import { Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { checkMac, parseMac } from "../lib/mac";

interface MacInputProps {
	id: string;
	value: string;
	onChange: (value: string) => void;
	disabled?: boolean;
	invalid?: boolean;
}

export function MacInput({ id, value, onChange, disabled, invalid }: MacInputProps) {
	const check = checkMac(value);

	return (
		<div className="space-y-1.5">
			<Input
				id={id}
				value={value}
				disabled={disabled}
				placeholder="Paste or type it any way, like aabb.ccdd.eeff"
				inputMode="text"
				autoCapitalize="characters"
				autoComplete="off"
				autoCorrect="off"
				spellCheck={false}
				aria-invalid={invalid || check.state === "invalid"}
				className="text-mono"
				onChange={(e) => onChange(e.target.value)}
				onBlur={() => {
					const mac = parseMac(value);
					if (mac && mac !== value) onChange(mac);
				}}
			/>
			{check.state === "valid" && (
				<p className="flex items-center gap-1.5 text-[12px] text-success">
					<Check className="size-3.5" />
					Will be saved as <span className="text-mono font-medium">{check.mac}</span>
				</p>
			)}
			{check.state === "typing" && <p className="text-[12px] text-muted-foreground">{check.count} of 12 characters</p>}
			{check.state === "invalid" && <p className="text-[12px] text-destructive">{check.reason}</p>}
		</div>
	);
}

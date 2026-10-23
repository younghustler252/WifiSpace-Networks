"use client";

import { Field } from "@/components/shared/field";
import { Input } from "@/components/ui/input";

function nowLocalValue() {
	const now = new Date();
	now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
	return now.toISOString().slice(0, 16);
}

export function startDateToIso(value: string): { iso?: string; error?: string } {
	if (!value) return {};
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return { error: "That start date isn't valid" };
	if (date.getTime() > Date.now()) return { error: "The start date can't be in the future" };
	return { iso: date.toISOString() };
}

interface StartDateFieldProps {
	id: string;
	value: string;
	onChange: (value: string) => void;
	hint?: string;
}

export function StartDateField({ id, value, onChange, hint }: StartDateFieldProps) {
	return (
		<Field
			label="Started earlier? (optional)"
			htmlFor={id}
			hint={hint ?? "Leave empty to start now. Set a past date if the customer already paid earlier. Time is counted from that date."}
		>
			<Input id={id} type="datetime-local" max={nowLocalValue()} value={value} onChange={(e) => onChange(e.target.value)} />
		</Field>
	);
}

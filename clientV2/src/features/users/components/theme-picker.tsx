"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { useThemePreference } from "../hooks/use-users";

const OPTIONS = [
	{ value: "light", label: "Light", icon: Sun },
	{ value: "dark", label: "Dark", icon: Moon },
	{ value: "system", label: "System", icon: Monitor },
] as const;

export function ThemePicker() {
	const { theme, change } = useThemePreference();

	return (
		<div role="radiogroup" aria-label="Theme" className="grid grid-cols-3 gap-2">
			{OPTIONS.map(({ value, label, icon: Icon }) => {
				const active = theme === value;
				return (
					<button
						key={value}
						type="button"
						role="radio"
						aria-checked={active}
						onClick={() => change(value)}
						className={cn(
							"flex flex-col items-center gap-1.5 rounded-lg border bg-surface-2 py-3 text-[12px] transition-colors",
							"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
							active ? "border-primary text-foreground ring-1 ring-primary" : "text-muted-foreground hover:border-primary/50"
						)}
					>
						<Icon className={cn("size-4", active && "text-signal")} />
						{label}
					</button>
				);
			})}
		</div>
	);
}
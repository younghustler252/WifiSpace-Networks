import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const TONES = {
	primary: "bg-accent text-signal",
	success: "bg-success-soft text-success",
	warning: "bg-warning-soft text-warning",
	destructive: "bg-destructive/10 text-destructive",
} as const;

interface StatusMessageProps {
	icon: LucideIcon;
	title: string;
	text?: string;
	tone?: keyof typeof TONES;
	pulse?: boolean;
	children?: React.ReactNode;
}

export function StatusMessage({ icon: Icon, title, text, tone = "primary", pulse, children }: StatusMessageProps) {
	return (
		<div className="flex flex-col items-center gap-5 py-10 text-center">
			<div className={cn("flex size-16 items-center justify-center rounded-2xl", TONES[tone], pulse && "pulse-signal")}>
				<Icon className="size-8" />
			</div>
			<div className="space-y-2">
				<h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
				{text && <p className="mx-auto max-w-xs text-sm text-muted-foreground">{text}</p>}
			</div>
			{children && <div className="w-full space-y-3 pt-2">{children}</div>}
		</div>
	);
}
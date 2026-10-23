import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgressStepsProps {
	steps: string[];
	current: number;
	className?: string;
}

export function ProgressSteps({ steps, current, className }: ProgressStepsProps) {
	return (
		<ol className={cn("card-elevated divide-y bg-surface-2 text-left", className)}>
			{steps.map((label, index) => {
				const done = index < current;
				const active = index === current;

				return (
					<li key={label} className="flex items-center gap-3 px-4 py-3">
						<span
							className={cn(
								"flex size-7 shrink-0 items-center justify-center rounded-full border text-[11px]",
								done && "border-success bg-success text-background",
								active && "border-signal text-signal",
								!done && !active && "border-border text-muted-foreground"
							)}
						>
							{done ? <Check className="size-4" strokeWidth={3} /> : active ? <Loader2 className="size-4 animate-spin" /> : index + 1}
						</span>
						<span className={cn("text-sm", done && "text-muted-foreground", active && "font-medium", !done && !active && "text-muted-foreground")}>{label}</span>
					</li>
				);
			})}
		</ol>
	);
}

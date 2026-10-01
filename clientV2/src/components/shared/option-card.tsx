import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface OptionCardProps {
	icon: LucideIcon;
	title: string;
	description: string;
	selected: boolean;
	onSelect: () => void;
}

export function OptionCard({ icon: Icon, title, description, selected, onSelect }: OptionCardProps) {
	return (
		<button
			type="button"
			role="radio"
			aria-checked={selected}
			onClick={onSelect}
			className={cn(
				"flex w-full items-start gap-3 rounded-2xl border bg-card p-4 text-left transition-all active:scale-[0.99]",
				"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
				selected ? "border-primary bg-accent/40 ring-1 ring-primary" : "hover:border-primary/50"
			)}
		>
			<span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
				<Icon className="size-5" />
			</span>
			<span className="space-y-0.5">
				<span className="block text-sm font-medium">{title}</span>
				<span className="block text-[13px] text-muted-foreground">{description}</span>
			</span>
		</button>
	);
}
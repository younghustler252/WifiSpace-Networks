import { cn } from "@/lib/utils";

interface InfoTileProps {
	label: string;
	value: React.ReactNode;
	hint?: string;
	mono?: boolean;
	className?: string;
	children?: React.ReactNode;
}

export function InfoTile({ label, value, hint, mono = true, className, children }: InfoTileProps) {
	return (
		<div className={cn("card-elevated bg-surface-2 p-2.5", className)}>
			<div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
			<div className={cn("mt-0.5 truncate text-[13px]", mono && "text-mono")}>{value}</div>
			{hint && <div className="text-[11px] text-muted-foreground">{hint}</div>}
			{children}
		</div>
	);
}
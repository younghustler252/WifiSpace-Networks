import Link from "next/link";
import { cn } from "@/lib/utils";

interface StatCardProps {
	label: string;
	value: React.ReactNode;
	hint?: string;
	href?: string;
	linkLabel?: string;
	highlight?: boolean;
	className?: string;
}

export function StatCard({ label, value, hint, href, linkLabel, highlight, className }: StatCardProps) {
	return (
		<div className={cn("card-elevated flex flex-col gap-1 p-4", highlight && "border-warning/40 bg-warning-soft", className)}>
			<div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
			<div className="text-mono text-3xl font-semibold">{value}</div>
			{hint && <div className="text-[12px] text-muted-foreground">{hint}</div>}
			{href && (
				<Link href={href} className="mt-2 text-[12px] text-signal hover:underline">
					{linkLabel ?? "View"} →
				</Link>
			)}
		</div>
	);
}
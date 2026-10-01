import { cn } from "@/lib/utils";

interface SectionCardProps {
	title: string;
	description?: string;
	actions?: React.ReactNode;
	className?: string;
	children: React.ReactNode;
}

export function SectionCard({ title, description, actions, className, children }: SectionCardProps) {
	return (
		<section className={cn("card-elevated", className)}>
			<header className="flex items-center justify-between gap-3 border-b px-4 py-3">
				<div className="min-w-0">
					<h2 className="truncate text-sm font-medium">{title}</h2>
					{description && <p className="text-[12px] text-muted-foreground">{description}</p>}
				</div>
				{actions}
			</header>
			<div className="p-4">{children}</div>
		</section>
	);
}
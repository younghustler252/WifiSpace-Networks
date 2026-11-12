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
		<section className={cn("card-elevated min-w-0", className)}>
			<header className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b px-4 py-3">
				<div className="min-w-0">
					<h2 className="text-sm font-medium [overflow-wrap:anywhere]">{title}</h2>
					{description && <p className="text-[12px] text-muted-foreground">{description}</p>}
				</div>
				{actions}
			</header>
			<div className="min-w-0 p-4">{children}</div>
		</section>
	);
}
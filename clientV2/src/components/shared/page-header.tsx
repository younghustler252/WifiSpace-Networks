interface PageHeaderProps {
	title: string;
	description?: string;
	actions?: React.ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
	return (
		<div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
			<div className="min-w-0 space-y-1">
				<h1 className="text-xl font-semibold tracking-tight [overflow-wrap:anywhere] md:text-2xl">{title}</h1>
				{description && <p className="text-[13px] text-muted-foreground [overflow-wrap:anywhere]">{description}</p>}
			</div>
			{actions && <div className="min-w-0 sm:shrink-0">{actions}</div>}
		</div>
	);
}
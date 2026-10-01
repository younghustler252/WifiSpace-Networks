interface PageHeaderProps {
	title: string;
	description?: string;
	actions?: React.ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
	return (
		<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
			<div className="space-y-1">
				<h1 className="text-xl font-semibold tracking-tight md:text-2xl">{title}</h1>
				{description && <p className="text-[13px] text-muted-foreground">{description}</p>}
			</div>
			{actions}
		</div>
	);
}
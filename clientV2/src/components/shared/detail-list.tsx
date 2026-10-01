interface DetailListProps {
	rows: { label: string; value: React.ReactNode }[];
}

export function DetailList({ rows }: DetailListProps) {
	return (
		<dl className="divide-y text-[13px]">
			{rows.map((row) => (
				<div key={row.label} className="flex items-center justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
					<dt className="shrink-0 text-muted-foreground">{row.label}</dt>
					<dd className="min-w-0 truncate text-right">{row.value}</dd>
				</div>
			))}
		</dl>
	);
}
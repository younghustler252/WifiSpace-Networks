interface Props {
	label: string;
	value: React.ReactNode;
	icon: React.ReactNode;
}

export default function SubscriptionStat({
	label,
	value,
	icon,
}: Props) {
	return (
		<div className="rounded-2xl border border-border bg-card p-5 flex items-center justify-between">

			<div>

				<p className="text-xs text-muted-foreground">
					{label}
				</p>

				<p className="text-xl font-semibold mt-1">
					{value}
				</p>

			</div>

			<div className="text-accent">
				{icon}
			</div>

		</div>
	);
}
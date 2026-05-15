interface MobileDataCardProps {
	title: string;
	subtitle?: string;
	badge?: React.ReactNode;
	fields: { label: string; value: React.ReactNode }[];
	onClick?: () => void;
	actions?: React.ReactNode;
}

export function MobileDataCard({
	title,
	subtitle,
	badge,
	fields,
	onClick,
	actions,
}: MobileDataCardProps) {
	return (
		<div
			onClick={onClick}
			className="
				ui-card
				group
				transition-all
				active:scale-[0.99]
				hover:shadow-card-hover
				cursor-pointer
			"
		>

			{/* ================= HEADER ================= */}
			<div className="flex items-start justify-between gap-3">

				{/* LEFT */}
				<div className="space-y-1">
					<h3 className="font-semibold text-base text-foreground leading-tight">
						{title}
					</h3>

					{subtitle && (
						<p className="text-xs text-muted-foreground">
							{subtitle}
						</p>
					)}
				</div>

				{/* RIGHT BADGE */}
				{badge && (
					<div className="shrink-0">
						{badge}
					</div>
				)}

			</div>

			{/* ================= DIVIDER ================= */}
			<div className="my-3 h-px bg-border/60" />

			{/* ================= FIELDS ================= */}
			<div className="space-y-2">

				{fields.map((field, i) => (
					<div
						key={i}
						className="
							flex
							items-center
							justify-between
							text-sm
						"
					>
						<span className="text-muted-foreground">
							{field.label}
						</span>

						<span className="text-foreground font-medium">
							{field.value}
						</span>
					</div>
				))}

			</div>

			{/* ================= FOOTER ACTIONS ================= */}
			{actions && (
				<div
					onClick={(e) => e.stopPropagation()}
					className="
						mt-4
						pt-3
						border-t
						border-border/60
						flex
						justify-end
						gap-2
					"
				>
					{actions}
				</div>
			)}

		</div>
	);
}
"use client";

interface Props {
	label: string;
	value: React.ReactNode;
}

export default function SubscriptionInfo({
	label,
	value,
}: Props) {
	return (
		<div className="flex items-center justify-between gap-4 text-sm">
			<span className="text-muted-foreground">
				{label}
			</span>

			<span className="font-medium text-right">
				{value}
			</span>
		</div>
	);
}
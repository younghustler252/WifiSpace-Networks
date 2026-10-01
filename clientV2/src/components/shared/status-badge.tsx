import { cn } from "@/lib/utils";

const TONES = {
	success: "border-success/30 bg-success-soft text-success",
	warning: "border-warning/30 bg-warning-soft text-warning",
	danger: "border-destructive/30 bg-destructive/10 text-destructive",
	info: "border-info/30 bg-info-soft text-info",
	neutral: "border-border bg-muted text-muted-foreground",
} as const;

type Tone = keyof typeof TONES;

const STATUS_TONE: Record<string, Tone> = {
	active: "success",
	approved: "success",
	successful: "success",
	online: "success",
	pending: "warning",
	initiated: "warning",
	grace: "warning",
	paused: "warning",
	suspended: "danger",
	failed: "danger",
	rejected: "danger",
	terminated: "danger",
	offline: "danger",
	expired: "neutral",
	canceled: "neutral",
};

interface StatusBadgeProps {
	status: string;
	label?: string;
	className?: string;
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
	const tone = STATUS_TONE[status.toLowerCase()] ?? "neutral";

	return (
		<span
			className={cn(
				"inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-medium capitalize",
				TONES[tone],
				className
			)}
		>
			<span className="status-dot" />
			{label ?? status}
		</span>
	);
}
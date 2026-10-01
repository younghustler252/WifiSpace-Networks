import { AlertTriangle, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const TONES = {
	warning: { box: "border-warning/30 bg-warning-soft", icon: AlertTriangle, iconClass: "text-warning" },
	danger: { box: "border-destructive/30 bg-destructive/10", icon: XCircle, iconClass: "text-destructive" },
	info: { box: "border-signal/30 bg-info-soft", icon: Info, iconClass: "text-signal" },
} as const;

interface NoticeProps {
	tone: keyof typeof TONES;
	title: string;
	text?: string;
}

export function Notice({ tone, title, text }: NoticeProps) {
	const t = TONES[tone];
	const Icon = t.icon;

	return (
		<div role="status" className={cn("flex gap-3 rounded-lg border p-3", t.box)}>
			<Icon className={cn("mt-0.5 size-4 shrink-0", t.iconClass)} />
			<div className="space-y-0.5">
				<p className="text-[13px] font-medium">{title}</p>
				{text && <p className="text-[12px] text-muted-foreground">{text}</p>}
			</div>
		</div>
	);
}
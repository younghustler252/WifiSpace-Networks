import { Wifi } from "lucide-react";
import { company } from "@/config/company";
import { cn } from "@/lib/utils";

const SIZES = {
	sm: { box: "size-7 rounded-md", icon: "size-4", text: "text-base" },
	md: { box: "size-9 rounded-lg", icon: "size-5", text: "text-lg" },
	lg: { box: "size-11 rounded-xl", icon: "size-6", text: "text-xl" },
} as const;

interface LogoProps {
	className?: string;
	showName?: boolean;
	size?: keyof typeof SIZES;
}

export function Logo({ className, showName = true, size = "md" }: LogoProps) {
	const s = SIZES[size];

	return (
		<span className={cn("inline-flex items-center gap-2.5", className)}>
			<span className={cn("flex items-center justify-center bg-primary text-primary-foreground signal-glow", s.box)}>
				<Wifi className={s.icon} strokeWidth={2.5} />
			</span>
			{showName && <span className={cn("font-semibold tracking-tight", s.text)}>{company.name}</span>}
		</span>
	);
}
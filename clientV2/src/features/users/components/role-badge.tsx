import { cn } from "@/lib/utils";

const ROLE_CLASSES: Record<string, string> = {
	superadmin: "border-signal/30 bg-info-soft text-signal",
	staff: "border-border bg-muted text-foreground",
	customer: "border-border text-muted-foreground",
};

export function RoleBadge({ role }: { role: string }) {
	return (
		<span
			className={cn(
				"inline-flex whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize",
				ROLE_CLASSES[role] ?? ROLE_CLASSES.customer
			)}
		>
			{role}
		</span>
	);
}
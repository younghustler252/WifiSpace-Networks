import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SimplePaginationProps {
	page: number;
	totalPages: number;
	onChange: (page: number) => void;
	className?: string;
}

export function SimplePagination({ page, totalPages, onChange, className }: SimplePaginationProps) {
	if (totalPages <= 1) return null;

	return (
		<div className={cn("flex items-center justify-between", className)}>
			<Button variant="outline" size="sm" className="bg-surface-2" disabled={page <= 1} onClick={() => onChange(page - 1)}>
				Previous
			</Button>
			<span className="text-[12px] text-muted-foreground">
				Page {page} of {totalPages}
			</span>
			<Button variant="outline" size="sm" className="bg-surface-2" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
				Next
			</Button>
		</div>
	);
}
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
	return (
		<div className="space-y-6">
			<Skeleton className="h-10 w-56 rounded-lg" />
			<Skeleton className="h-64 rounded-xl" />
		</div>
	);
}
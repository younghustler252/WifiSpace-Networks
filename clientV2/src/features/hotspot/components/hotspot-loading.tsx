export function HotspotLoading() {
	return (
		<div className="space-y-4 text-center py-8">
			<div className="mx-auto h-10 w-10 rounded-full border-2 border-border border-t-accent animate-spin" />
			<p className="text-sm text-muted-foreground">Checking your connection…</p>
		</div>
	);
}

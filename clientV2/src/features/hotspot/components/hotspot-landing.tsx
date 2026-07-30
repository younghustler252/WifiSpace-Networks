interface HotspotLandingProps {
	onGetStarted: () => void;
	onSignIn: () => void;
	routerName?: string | null;
}

export function HotspotLanding({ onGetStarted, onSignIn, routerName }: HotspotLandingProps) {
	return (
		<div className="space-y-6">
			<div>
				<div className="text-[11px] uppercase tracking-wider text-accent">Hotspot portal</div>
				<h1 className="mt-2 text-3xl font-semibold tracking-tight">Welcome to WifiSpace</h1>
				<p className="mt-2 text-muted-foreground text-sm">
					Choose a plan and get connected in seconds.
				</p>
			</div>

			{routerName ? (
				<div className="ui-card p-4">
					<p className="text-xs uppercase text-muted-foreground">
						Access point
					</p>

					<div className="mt-2 flex items-center justify-between">
						<span className="font-mono text-sm">
							{routerName}
						</span>

						<span className="flex items-center gap-2 text-xs text-success">
							<span className="h-2 w-2 rounded-full bg-success animate-pulse" />
							Online
						</span>
					</div>
				</div>
			) : null}

			<div className="space-y-3">
				<button className="ui-button ui-button-accent w-full" onClick={onGetStarted}>
					Get connected
				</button>
				<button className="ui-button-outline w-full" onClick={onSignIn}>
					I already have an account
				</button>
			</div>
		</div>
	);
}

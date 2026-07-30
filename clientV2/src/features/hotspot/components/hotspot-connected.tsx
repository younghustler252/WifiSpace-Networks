import type {
	HotspotAccount,
	HotspotSubscription,
	HotspotPlanSnapshot
} from "../api/hotspot.types";

interface HotspotConnectedProps {
	account: HotspotAccount | null;
	subscription: HotspotSubscription | null;
	plan: HotspotPlanSnapshot | null;
	onLogout: () => void;
	isLoggingOut?: boolean;
}

export function HotspotConnected({
	account,
	subscription,
	plan,
	onLogout,
	isLoggingOut
}: HotspotConnectedProps) {
	const expiresAt = subscription?.expiresAt ? new Date(subscription.expiresAt) : null;

	return (
		<div className="space-y-6 text-center">
			<div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-success/15">
				<svg viewBox="0 0 24 24" className="h-8 w-8 text-success" fill="none" stroke="currentColor" strokeWidth={2}>
					<path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
				</svg>
			</div>

			<div>
				<h1 className="text-2xl font-semibold tracking-tight">You're online</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					{plan ? `Connected on ${plan.name}` : "Your device is connected"}
				</p>
			</div>

			<div className="ui-card !p-4 text-left space-y-2 text-[13px]">
				<Row k="Plan" v={plan?.name ?? "—"} />
				<Row k="Speed" v={plan?.speedRate ?? "—"} />
				<Row
					k="Expires"
					v={expiresAt ? expiresAt.toLocaleString() : "—"}
				/>
				<Row k="Connection ID" v={account?.wsnId ?? "—"} />
			</div>

			<button
				className="ui-button-outline w-full"
				onClick={onLogout}
				disabled={isLoggingOut}
			>
				{isLoggingOut ? "Logging out…" : "Forget this device"}
			</button>
		</div>
	);
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
	return (
		<div className="flex items-center justify-between">
			<span className="text-muted-foreground">{k}</span>
			<span className="text-foreground">{v}</span>
		</div>
	);
}

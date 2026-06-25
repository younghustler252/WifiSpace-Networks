export function HotspotSuccessScreen({
	payment,
	autoConnected,
	onBrowse,
	onDashboard
}: any) {
	return (
		<div className="card">
			<h2>You're Online 🎉</h2>

			<p>
				{autoConnected
					? "Device connected successfully"
					: "Reconnect WiFi to activate session"}
			</p>

			<p>Plan: {payment?.planId?.name}</p>
			<p>Amount: ₦{payment?.amount?.total}</p>

			<div className="row">
				{autoConnected && (
					<button onClick={onBrowse}>
						Start Browsing
					</button>
				)}

				<button onClick={onDashboard}>
					Dashboard
				</button>
			</div>
		</div>
	);
}
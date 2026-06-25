export function HotspotAccountSelector({
	accounts,
	onSelect
}: {
	accounts: any[];
	onSelect: (account: any) => void;
}) {
	return (
		<div>
			<h2>Select Account</h2>

			{accounts.map((item) => (
				<div
					key={item.account.id}
					className="card clickable"
					onClick={() => onSelect(item.account)}
				>
					<h3>{item.account.wsnId}</h3>
					<p>Status: {item.subscription?.status || "No subscription"}</p>
					<p>Plan: {item.plan?.name || "None"}</p>
				</div>
			))}
		</div>
	);
}
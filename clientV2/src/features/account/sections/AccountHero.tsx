"use client";

import { Wifi } from "lucide-react";

type Props = {
	account: any;
};

const AccountHero = ({ account }: Props) => {
	if (!account) return null;

	const statusBadge = () => {
		switch (account.profileStatus) {
			case "active":
				return <span className="ui-badge ui-badge-success">Active</span>;
			case "pending":
				return (
					<span className="ui-badge bg-warning/20 text-warning">
						Pending
					</span>
				);
			case "suspended":
				return <span className="ui-badge ui-badge-danger">Suspended</span>;
			default:
				return null;
		}
	};

	return (
		<div className="ui-card flex flex-col md:flex-row items-center gap-6">
			<div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
				<Wifi className="text-accent" size={20} />
			</div>

			<div className="flex-1 text-center md:text-left">
				<h2 className="text-2xl font-semibold">{account?.wsnId}</h2>
				<p className="text-sm text-muted-foreground mt-1">
					{account?.accountType} • {account?.serviceType}
				</p>
				<p className="text-xs text-muted-foreground mt-1 capitalize">
					Status: {account?.profileStatus}
				</p>
			</div>

			{statusBadge()}
		</div>
	);
};

export default AccountHero;
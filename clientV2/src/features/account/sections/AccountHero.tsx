"use client";

import { Wifi } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";

type Props = {
	account: any;
};

const AccountHero = ({ account }: Props) => {
	if (!account) return null;

	const getMappedVariant = (status: string) => {
		switch (status) {
			case "active":
				return "successful";
			case "suspended":
			case "canceled":
				return "failed";
			default:
				return "pending";
		}
	};

	return (
		<div className="ui-card flex flex-col md:flex-row items-center gap-6">
			<div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
				<Wifi className="text-accent" size={20} />
			</div>

			<div className="flex-1 text-center md:text-left">
				<h2 className="text-2xl font-semibold">{account?.wsnId}</h2>
				<p className="text-sm text-muted-foreground mt-1 capitalize">
					{account?.accountType} • {account?.serviceType}
				</p>
			</div>

			<StatusBadge variant={getMappedVariant(account.profileStatus)} size="md" withDot className="capitalize">
				{account.profileStatus}
			</StatusBadge>
		</div>
	);
};

export default AccountHero;

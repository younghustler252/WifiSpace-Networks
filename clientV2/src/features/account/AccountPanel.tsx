"use client";

import { useState } from "react";

import AccountHero from "./sections/AccountHero";
import AccountOverview from "./sections/AccountOverview";
import SecuritySettings from "./sections/security-settings";
import NetworkStatus from "./sections/NetworkStatus";
import SubscriptionSummary from "./sections/SubscriptionSummary";
import { PaymentSummary } from "./sections/PaymentSummary";

import { routerApi } from "@/lib/api/router";

type Props = {
	account: any;
	role?: "customer" | "superAdmin" | "staff";
};

const AccountPanel = ({
	account,
	role = "customer",
}: Props) => {
	const [retrying, setRetrying] = useState(false);

	if (!account) {
		return (
			<div className="p-6 text-center text-muted-foreground">
				No account data found
			</div>
		);
	}

	const isInternalUser =
		role === "superAdmin" || role === "staff";

	const handleRetryProvision = async (
		accountId: string
	) => {
		try {
			setRetrying(true);

			await routerApi.resumeAccount(accountId);

			window.location.reload();
		} catch (error) {
			console.error(
				"Provision retry failed:",
				error
			);
		} finally {
			setRetrying(false);
		}
	};

	return (
		<div className="space-y-8">

			<AccountHero account={account} />

			<div className={
	isInternalUser
		? "grid grid-cols-1 md:grid-cols-2 gap-8"
		: "grid grid-cols-1 gap-8"
}>

				{/* LEFT */}
				<div className="flex flex-col space-y-8 min-w-0">

					<AccountOverview
						account={account}
						role={role}
					/>

					{isInternalUser && (
						<SecuritySettings
							account={account}
							role={role}
						/>
					)}

				</div>

				{/* RIGHT */}
				{isInternalUser && (
					<div className="flex flex-col space-y-8 min-w-0">

						<SubscriptionSummary
							accountId={account.id}
							userId={account.userId}
							role={role}
						/>

						<NetworkStatus
							account={account}
							role={role}
							onRetry={
								handleRetryProvision
							}
							retrying={retrying}
						/>

						<PaymentSummary
							accountId={account.id}
						/>

					</div>
				)}

			</div>

		</div>
	);
};

export default AccountPanel;
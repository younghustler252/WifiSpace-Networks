"use client";

import Card, { CardContent, CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";

type Role = "customer" | "staff" | "superadmin";

interface Props {
	role: Role;

	hasActiveSubscription: boolean;
	isSuspended: boolean;

	onRenew?: () => void;
	onUpgrade?: () => void;

	onAssign?: () => void;

	onSuspend?: () => void;
	onResume?: () => void;
	onExtend?: () => void;
	onExpire?: () => void;

	onAdminRenew?: () => void;
	onAdminChangePlan?: () => void;

	loadingStates?: {
		resume?: boolean;
		extend?: boolean;
		expire?: boolean;
		assign?: boolean;
		adminRenew?: boolean;
		adminChangePlan?: boolean;
		suspend?: boolean; // Good practice to add this as well
	};
}

export default function SubscriptionActions({
	role,
	hasActiveSubscription,
	isSuspended,

	onRenew,
	onUpgrade,

	onAssign,

	onSuspend,
	onResume,
	onExtend,
	onExpire,

	onAdminRenew,
	onAdminChangePlan,

	loadingStates,
}: Props) {
	const isCustomer = role === "customer";

	return (
		<Card>
			<CardHeader>
				<h3 className="font-semibold">
					Subscription Actions
				</h3>
			</CardHeader>

			<CardContent className="space-y-5">

				{/* ================= CUSTOMER ================= */}
				{isCustomer && (
					<div className="space-y-3">
						<Button
							fullWidth
							onClick={onRenew}
						>
							Renew Subscription
						</Button>

						<Button
							fullWidth
							variant="outline"
							onClick={onUpgrade}
						>
							Upgrade Plan
						</Button>
					</div>
				)}

				{/* ================= ADMIN ================= */}
				{!isCustomer && (
					<>
						{/* ================= BILLING ACTIONS ================= */}
						{/* Safe guard: only allow renewals/changes if an account already has a sub context */}
						{hasActiveSubscription && (
							<>
								<div className="space-y-3">
									<Button
										fullWidth
										onClick={onAdminRenew}
										variant="outline"
										isLoading={loadingStates?.adminRenew} // Added loading indicator
									>
										Admin Renew
									</Button>

									<Button
										fullWidth
										variant="accent"
										onClick={onAdminChangePlan}
										className="text-center justify-center"
										isLoading={loadingStates?.adminChangePlan} // Added loading indicator
									>
										Change Plan
									</Button>

									<Button
										fullWidth
										variant="outline"
										onClick={onExtend}
										isLoading={loadingStates?.extend}
									>
										Extend Days
									</Button>
								</div>

								{/* DIVIDER */}
								<div className="h-px bg-border my-4" />
							</>
						)}

						{/* ================= CONTROL ACTIONS ================= */}
						<div className="space-y-3">

							{hasActiveSubscription ? (
								<>
									{isSuspended ? (
										<Button
											fullWidth
											onClick={onResume}
											isLoading={loadingStates?.resume}
										>
											Resume Subscription
										</Button>
									) : (
										<Button
											fullWidth
											variant="outline"
											onClick={onSuspend}
											isLoading={loadingStates?.suspend}
										>
											Suspend Subscription
										</Button>
									)}

									<Button
										fullWidth
										variant="danger"
										onClick={onExpire}
										isLoading={loadingStates?.expire}
									>
										Expire Subscription
									</Button>
								</>
							) : (
								<Button
									fullWidth
									onClick={onAssign}
									isLoading={loadingStates?.assign}
								>
									Assign Subscription
								</Button>
							)}
						</div>
					</>
				)}
			</CardContent>
		</Card>
	);
}

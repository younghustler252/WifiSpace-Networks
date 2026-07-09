"use client";

import { HotspotNewUserScreen } from "@/features/hotspot/components/NewUserScreen";
import { HotspotPlanSelector } from "@/features/hotspot/components/PlanSelector";
import { HotspotPaymentProcessing } from "@/features/hotspot/components/PaymentProcessing";
import { HotspotSuccessScreen } from "@/features/hotspot/components/SuccessScreen";
import { HotspotErrorScreen } from "@/features/hotspot/components/ErrorScreen";
import { HotspotIdentityScreen } from "@/features/hotspot/components/IdentityScreen";

import Logo from "@/components/ui/Logo";
import { CenterLoader } from "@/components/ui/Loader";

export type HotspotUIState =
	| "LOADING"
	| "REGISTER_USER"
	| "IDENTITY_LOOKUP"
	| "SELECT_PLAN"
	| "PAYMENT_PROCESSING"
	| "SUCCESS"
	| "ERROR";

interface Props {
	state: HotspotUIState;
	session: any;
	plans: any[];
	paymentResult: any;
	error: string;
	actions: any;
	macAddress?: string;

}

export function HotspotRenderer({
	state,
	session,
	plans,
	paymentResult,
	error,
	actions,
	macAddress,

}: Props) {
	const account = session?.accounts?.[0]?.account;
	const subscription = session?.accounts?.[0]?.subscription;
	const plan = session?.accounts?.[0]?.plan;
	const deviceMac = macAddress || account?.macAddress || "Unknown Device";

	const canGoBack =
		state === "IDENTITY_LOOKUP" ||
		state === "REGISTER_USER";

	return (
		<main className="min-h-screen bg-background px-4 py-5">
			<div className="mx-auto flex min-h-screen w-full max-w-md flex-col">
				<header className="relative flex items-center justify-center pb-6">
					{canGoBack && (
						<button
							onClick={actions.goBack}
							className="absolute left-0 flex h-9 w-9 items-center justify-center rounded-full border bg-background text-muted-foreground transition-colors hover:bg-muted"
						>
							←
						</button>
					)}

					<Logo size="md" />
				</header>

				<section className="flex-1">

					{state === "LOADING" && (
						<CenterLoader label="Connecting..." />
					)}

					{state === "IDENTITY_LOOKUP" && (
						<HotspotIdentityScreen
							loading={false}
							error={error}
							onLookup={actions.lookupAccount}
						/>
					)}

					{state === "REGISTER_USER" && (
						<div className="space-y-5">
							<div className="text-center">
								<h1 className="text-xl font-semibold">
									Create Account
								</h1>

								<p className="mt-1 text-sm text-muted-foreground">
									Enter your details to continue.
								</p>
							</div>

							<HotspotNewUserScreen
								onSubmit={actions.registerUser}
							/>
						</div>
					)}

					{state === "SELECT_PLAN" && (
						<div className="space-y-6">
							<div className="text-center">
								{session?.hasHotspotAccount ? (
									<>
										<p className="mt-1 text-sm text-muted-foreground">
											{subscription?.status === "active"
												? "Renew or upgrade your plan."
												: "Choose a plan to reconnect."}
										</p>

										<div className="mt-5 rounded-2xl border bg-card p-4 text-left">
											<div className="grid grid-cols-2 gap-x-6 gap-y-1">
												<div>
													<p className="text-[11px] uppercase tracking-wide text-muted-foreground">
														Account
													</p>

													{account?.wsnId && (
														<p className="mt-2 font-mono text-sm font-semibold">
															#{account.wsnId}
														</p>
													)}

													<p className="mt-1 break-all font-mono text-[11px] text-muted-foreground">
														{deviceMac}
													</p>
												</div>

												<div className="text-right">
													<p className="text-[11px] uppercase tracking-wide text-muted-foreground">
														Subscription
													</p>

													<p className="mt-2 font-semibold">
														{subscription?.status === "active"
															? plan?.name || "Active Plan"
															: "No Active Plan"}
													</p>

													<p
														className={`mt-1 text-sm font-medium ${
															subscription?.status === "active"
																? "text-emerald-600"
																: "text-muted-foreground"
														}`}
													>
														{subscription?.status === "active"
															? "● Active"
															: "Inactive"}
													</p>

													{subscription?.expiresAt && (
														<p className="mt-1 text-[11px] text-muted-foreground">
															Exp.{" "}
															{new Date(
																subscription.expiresAt
															).toLocaleDateString("en-NG", {
																month: "short",
																day: "numeric",
															})}
														</p>
													)}
												</div>
											</div>
										</div>

										<p className="mt-5 text-center text-sm text-muted-foreground">
											Choose a plan
										</p>
									</>
								) : (
									<>
										<h1 className="text-xl font-semibold">
											Choose a Plan
										</h1>

										<p className="mt-1 text-sm text-muted-foreground">
											Get connected in minutes.
										</p>

										<button
											onClick={actions.showIdentity}
											className="mt-3 text-sm font-medium text-primary"
										>
											Already have an account?
										</button>
									</>
								)}
							</div>

							<HotspotPlanSelector
								plans={plans ?? []}
								currentPlanPrice={
									subscription?.status === "active"
										? subscription.planSnapshot?.price || 0
										: 0
								}
								onSelect={actions.selectPlan}
							/>
						</div>
					)}

					{state === "PAYMENT_PROCESSING" && (
						<HotspotPaymentProcessing />
					)}

					{state === "SUCCESS" && (
						<HotspotSuccessScreen
							payment={paymentResult?.payment}
							autoConnected={paymentResult?.autoConnected}
							onBrowse={actions.browse}
							onDashboard={actions.dashboard}
						/>
					)}

					{state === "ERROR" && (
						<HotspotErrorScreen
							message={error}
							onRetry={actions.retry}
						/>
					)}
				</section>

				<footer className="py-5 text-center text-[11px] text-muted-foreground">
					Powered by Wifispace
				</footer>
			</div>
		</main>
	);
}
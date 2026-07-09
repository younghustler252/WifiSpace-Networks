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

	const canGoBack = [
		"IDENTITY_LOOKUP",
		"REGISTER_USER",
		"SELECT_PLAN",
	].includes(state);

	return (
		<main className="min-h-screen bg-background px-4 py-8 flex flex-col items-center">
			<header className="flex flex-col items-center text-center mb-8">
				<Logo size="lg" />

				<p className="mt-3 text-sm text-muted-foreground">
					Fast and reliable internet access
				</p>

				<div className="mt-5 inline-flex items-center gap-2 rounded-full border bg-muted/40 px-4 py-2">
					<span className="text-xs text-muted-foreground">
						Connected Device
					</span>

					<span className="font-mono text-xs font-semibold uppercase">
						{deviceMac}
					</span>
				</div>
			</header>

			<section className="w-full max-w-4xl">
				{canGoBack && (
					<div className="mb-6">
						<button
							onClick={actions.goBack}
							className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
						>
							← Back
						</button>
					</div>
				)}

				{state === "LOADING" && (
					<CenterLoader label="Connecting to hotspot..." />
				)}

				{state === "IDENTITY_LOOKUP" && (
					<HotspotIdentityScreen
						loading={false}
						error={error}
						onLookup={actions.lookupAccount}
					/>
				)}

				{state === "REGISTER_USER" && (
					<div>
						<div className="text-center mb-6">
							<h1 className="text-2xl font-bold">
								Welcome 👋
							</h1>

							<p className="text-muted-foreground">
								Enter your details to continue. Your hotspot
								will activate after payment.
							</p>
						</div>

						<HotspotNewUserScreen
							onSubmit={actions.registerUser}
						/>
					</div>
				)}

				{state === "SELECT_PLAN" && (
					<div>
						<div className="text-center mb-8">
							{session?.hasHotspotAccount ? (
								<>
									<h1 className="text-2xl font-bold">
										Welcome back{" "}
										{session?.user?.firstName ||
											"Customer"}{" "}
										👋
									</h1>

									<p className="text-sm text-muted-foreground mt-1">
										Your account was found. Review your
										current status below.
									</p>

									<div className="mt-6 max-w-sm mx-auto rounded-2xl border bg-background p-4 shadow-sm space-y-3 text-left">
										{account?.wsnId && (
											<div className="flex justify-between items-center text-xs">
												<span className="text-muted-foreground font-medium">
													Account ID
												</span>

												<span className="font-mono bg-neutral-100 px-2 py-0.5 rounded text-neutral-800 font-semibold">
													{account.wsnId}
												</span>
											</div>
										)}

										{account?.macAddress && (
											<div className="flex justify-between items-center text-xs pt-2 border-t border-dashed">
												<span className="text-muted-foreground font-medium">
													Registered Device
												</span>

												<span className="font-mono text-neutral-700 font-medium uppercase">
													{account.macAddress}
												</span>
											</div>
										)}

										{subscription?.status === "active" && (
											<div className="pt-2 border-t space-y-2">
												<div className="flex justify-between items-center text-xs">
													<span className="text-muted-foreground font-medium">
														Current Plan
													</span>

													<span className="font-bold">
														{plan?.name ||
															"Active Tier"}
													</span>
												</div>

												<div className="flex justify-between items-center">
													<span className="text-xs text-muted-foreground font-medium">
														Status
													</span>

													<span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 text-xs font-bold">
														<span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
														Active
													</span>
												</div>

												{subscription?.expiresAt && (
													<div className="flex justify-between items-center text-xs">
														<span className="text-muted-foreground">
															Expires On
														</span>

														<span className="text-neutral-700 font-medium">
															{new Date(
																subscription.expiresAt
															).toLocaleDateString(
																"en-NG",
																{
																	month: "short",
																	day: "numeric",
																	year: "numeric",
																}
															)}
														</span>
													</div>
												)}
											</div>
										)}
									</div>
								</>
							) : (
								<>
									<h1 className="text-2xl font-bold">
										Choose your internet plan
									</h1>

									<p className="text-muted-foreground">
										Select a package to get connected.
									</p>

									<button
										onClick={actions.showIdentity}
										className="mt-4 text-sm text-primary underline"
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

			<footer className="mt-10 text-xs text-muted-foreground">
				Powered by Wifispace Networks
			</footer>
		</main>
	);
}
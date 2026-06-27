"use client";

import { CreditCard, Calendar, ShieldCheck, Sparkles } from "lucide-react";
import { Subscription } from "../subscription.types";
import Card, { CardContent, CardHeader } from "@/components/ui/Card";

interface Props {
	subscription: Subscription;
}

export default function SubscriptionBillingInfo({ subscription }: Props) {
	const {
		planSnapshot,
		cycles,
		totalAmount,
		renewalStrategy,
		autoRenewEnabled,
		graceEndsAt,
		bonusDays,
		manualAdjustmentDays,
		lastPaymentAmount,
		lastPaymentDate,
	} = subscription;

	
	const formatCurrency = (val: number) => 
		new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(val);


	
	const formatDate = (dateValue?: string | Date) => 
		dateValue ? new Date(dateValue).toLocaleDateString(undefined, { dateStyle: 'medium' }) : "N/A";


	return (
		<Card>
			<CardHeader>
				<div className="flex items-center gap-2">
					<CreditCard className="h-5 w-5 text-muted-foreground" />
					<h3 className="font-semibold text-lg">Billing & Cycle Structure</h3>
				</div>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* High Density Cost Breakdown Grid */}
				<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
					<div className="border-r border-border/60 last:border-0 pr-2">
						<span className="text-xs font-medium text-muted-foreground block uppercase">Base Cost</span>
						<span className="text-base font-bold text-foreground">
							{formatCurrency(planSnapshot.price)}
							<span className="text-xs font-normal text-muted-foreground">/{planSnapshot.durationValue}{planSnapshot.durationUnit[0]}</span>
						</span>
					</div>
					<div className="border-r border-border/60 last:border-0 sm:pl-2 pr-2">
						<span className="text-xs font-medium text-muted-foreground block uppercase">Billed Cycles</span>
						<span className="text-base font-bold text-foreground">{cycles} Cycle(s)</span>
					</div>
					<div className="border-r border-border/60 last:border-0 pl-2 pr-2">
						<span className="text-xs font-medium text-muted-foreground block uppercase">Total Invoiced</span>
						<span className="text-base font-bold text-accent">{formatCurrency(totalAmount)}</span>
					</div>
					<div className="pl-2">
						<span className="text-xs font-medium text-muted-foreground block uppercase">Strategy</span>
						<span className="text-sm font-bold text-foreground capitalize">
							{renewalStrategy.replace("_", " ")}
							{autoRenewEnabled && " (Auto)"}
						</span>
					</div>
				</div>

				{/* Balance and Adjustments Section */}
				{(bonusDays > 0 || manualAdjustmentDays > 0 || graceEndsAt) && (
					<div className="space-y-3 bg-accent/5 rounded-xl p-4 border border-accent/10 text-sm">
						<h4 className="font-semibold text-xs text-accent uppercase tracking-wider flex items-center gap-1">
							<Sparkles className="h-3.5 w-3.5" /> Adjustments & Special Terms
						</h4>
						<div className="grid grid-cols-2 gap-3 text-xs">
							{bonusDays > 0 && (
								<div className="flex justify-between bg-background p-2 rounded-md border border-border">
									<span className="text-muted-foreground">Promotional Bonus:</span>
									<span className="font-bold text-green-600">+{bonusDays} Days</span>
								</div>
							)}
							{manualAdjustmentDays > 0 && (
								<div className="flex justify-between bg-background p-2 rounded-md border border-border">
									<span className="text-muted-foreground">Staff Adjustments:</span>
									<span className="font-bold text-blue-600">+{manualAdjustmentDays} Days</span>
								</div>
							)}
							{graceEndsAt && (
								<div className="col-span-2 flex justify-between bg-background p-2 rounded-md border border-border items-center">
									<span className="text-muted-foreground flex items-center gap-1">
										<ShieldCheck className="h-3.5 w-3.5 text-amber-500" /> Grace Window Active Until:
									</span>
									<span className="font-bold text-amber-600">{formatDate(graceEndsAt)}</span>
								</div>
							)}
						</div>
					</div>
				)}

				{/* Historical Ledger Record Snippet */}
				{lastPaymentAmount && (
					<div className="border-t border-border/60 pt-4 flex flex-col sm:flex-row justify-between text-xs text-muted-foreground gap-2">
						<div className="flex items-center gap-1.5">
							<Calendar className="h-3.5 w-3.5" />
							<span>Last Verified Payment: <strong className="text-foreground">{formatCurrency(lastPaymentAmount)}</strong></span>
						</div>
						<div>
							<span>Processed On: <strong className="text-foreground">{formatDate(lastPaymentDate)}</strong></span>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

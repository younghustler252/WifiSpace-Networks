import { Activity, Bell, CreditCard, ListChecks, RefreshCw, Zap, type LucideIcon } from "lucide-react";
import { Section } from "./section";

const FEATURES: { icon: LucideIcon; title: string; text: string }[] = [
	{ icon: Zap, title: "Instant activation", text: "Your plan switches on automatically as soon as your payment is confirmed." },
	{ icon: CreditCard, title: "Secure payments", text: "Checkout is handled by Paystack, so we never see or store your card details." },
	{ icon: Activity, title: "Live usage", text: "See how much time and data you've used and what's left on your plan." },
	{ icon: RefreshCw, title: "Easy renewals", text: "Renew from your dashboard whenever you like, early or after your plan ends." },
	{ icon: ListChecks, title: "Clear plans", text: "Every plan lists its speed, data and device limits up front, with no surprises." },
	{ icon: Bell, title: "Stay informed", text: "Get notified about payments, plans that are about to expire, and account updates." },
];

export function FeatureGrid() {
	return (
		<Section eyebrow="Why WifiSpace" title="Everything in one place" description="Manage your connection without calling anyone.">
			<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
				{FEATURES.map((feature) => (
					<div key={feature.title} className="card-elevated p-5">
						<span className="flex size-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
							<feature.icon className="size-5" />
						</span>
						<h3 className="mt-4 text-[15px] font-semibold">{feature.title}</h3>
						<p className="mt-1.5 text-[14px] text-muted-foreground">{feature.text}</p>
					</div>
				))}
			</div>
		</Section>
	);
}
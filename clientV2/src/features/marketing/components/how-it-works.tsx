import { Home, Wifi, type LucideIcon } from "lucide-react";
import { Section } from "./section";

interface Flow {
	icon: LucideIcon;
	title: string;
	steps: { title: string; text: string }[];
}

const FLOWS: Flow[] = [
	{
		icon: Home,
		title: "Home & office internet",
		steps: [
			{ title: "Create your account", text: "Sign up with your email and confirm it with a 6-digit code." },
			{ title: "Request an installation", text: "Tell us whether it's for home or business. Our team reviews it and arranges the install." },
			{ title: "Choose a plan and go online", text: "Once you're approved, pick a plan and pay securely. Your service activates automatically." },
		],
	},
	{
		icon: Wifi,
		title: "WifiSpace hotspots",
		steps: [
			{ title: "Join the WifiSpace wifi", text: "Connect your phone or laptop at any WifiSpace hotspot." },
			{ title: "Pick a plan", text: "The plan page opens automatically. Choose how long you need." },
			{ title: "Pay and browse", text: "Pay securely and you're online as soon as your payment is confirmed. No account needed." },
		],
	},
];

export function HowItWorks() {
	return (
		<Section id="how-it-works" eyebrow="How it works" title="Online in three simple steps" className="bg-sidebar">
			<div className="grid gap-5 md:grid-cols-2">
				{FLOWS.map((flow) => (
					<div key={flow.title} className="card-elevated p-6">
						<div className="flex items-center gap-3">
							<flow.icon className="size-5 text-signal" />
							<h3 className="text-lg font-semibold tracking-tight">{flow.title}</h3>
						</div>

						<ol className="mt-6 space-y-6">
							{flow.steps.map((step, index) => (
								<li key={step.title} className="flex gap-4">
									<span className="text-mono flex size-7 shrink-0 items-center justify-center rounded-full border bg-surface-2 text-[12px]">
										{index + 1}
									</span>
									<div>
										<p className="text-[15px] font-medium">{step.title}</p>
										<p className="mt-1 text-[14px] text-muted-foreground">{step.text}</p>
									</div>
								</li>
							))}
						</ol>
					</div>
				))}
			</div>
		</Section>
	);
}
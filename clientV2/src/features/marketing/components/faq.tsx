import { ChevronDown } from "lucide-react";
import { company } from "@/config/company";
import { Section } from "./section";

const ITEMS = [
	{
		q: "How do I get home internet?",
		a: "Create a WifiSpace account, then request an installation and tell us whether it's for home or business. Our team reviews your request and arranges the install. Once it's approved, you pick a plan, pay securely and your service activates automatically.",
	},
	{
		q: "How does the hotspot work?",
		a: "Join the WifiSpace wifi at any hotspot. A page opens automatically where you choose a plan and pay. As soon as your payment is confirmed you're online. You don't need to sign up first.",
	},
	{
		q: "How do I pay?",
		a: "Payments go through Paystack's secure checkout. We never see or store your card details.",
	},
	{
		q: "What happens when my plan ends?",
		a: "Your service stops when the plan expires, though some home plans include a short grace period. You can renew from your dashboard at any time, and hotspot users simply pick a new plan on the wifi page.",
	},
	{
		q: "How many devices can I connect?",
		a: "Each plan lists how many devices it allows, so you can check before you buy. You'll find it on the pricing page.",
	},
	{
		q: "Is my data capped?",
		a: "Every plan shows its data allowance upfront, either a set limit or unlimited. You can follow what you've used from your dashboard.",
	},
	{
		q: "Can I have both home internet and hotspot access?",
		a: "Yes. One WifiSpace login can hold both a home line and a hotspot identity.",
	},
];

export function Faq() {
	const { contact } = company;
	const reachUs = [contact.email, contact.phone].filter(Boolean).join(" or ");
	const items = reachUs
		? [...ITEMS, { q: "I need help. Who do I contact?", a: `You can reach us at ${reachUs}.` }]
		: ITEMS;

	return (
		<Section id="faq" eyebrow="FAQ" title="Questions, answered">
			<div className="card-elevated mx-auto max-w-3xl divide-y">
				{items.map((item) => (
					<details key={item.q} className="group px-5 py-4">
						<summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-medium [&::-webkit-details-marker]:hidden">
							{item.q}
							<ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
						</summary>
						<p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">{item.a}</p>
					</details>
				))}
			</div>
		</Section>
	);
}
import Link from "next/link";
import { Check, Home, Wifi, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section } from "./section";

interface Option {
	icon: LucideIcon;
	title: string;
	tagline: string;
	points: string[];
	primary: { href: string; label: string; variant: "default" | "outline" };
	secondary?: { href: string; label: string };
}

const OPTIONS: Option[] = [
	{
		icon: Home,
		title: "Home & office internet",
		tagline: "A dedicated line installed by our team.",
		points: ["A WifiSpace router set up at your location", "Recurring plans for personal or business use", "Track your time and data from your dashboard"],
		primary: { href: "/register", label: "Request installation", variant: "default" },
		secondary: { href: "/pricing?type=pppoe", label: "See home plans" },
	},
	{
		icon: Wifi,
		title: "WifiSpace hotspots",
		tagline: "Pay-as-you-go wifi in public spots.",
		points: ["No sign-up needed to get online", "Choose how long you need, then pay once", "Use it on the number of devices your plan allows"],
		primary: { href: "/pricing?type=hotspot", label: "See hotspot plans", variant: "outline" },
	},
];

export function ConnectionOptions() {
	return (
		<Section
			eyebrow="Two ways to connect"
			title="Whatever you need, we've got a way to get you online"
			description="A permanent line for your home or business, or quick wifi when you're out and about."
		>
			<div className="grid gap-5 md:grid-cols-2">
				{OPTIONS.map((option) => (
					<article key={option.title} className="card-elevated flex flex-col p-6">
						<span className="flex size-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
							<option.icon className="size-5" />
						</span>
						<h3 className="mt-5 text-xl font-semibold tracking-tight">{option.title}</h3>
						<p className="mt-1 text-[14px] text-muted-foreground">{option.tagline}</p>

						<ul className="mt-5 space-y-2.5 text-[14px]">
							{option.points.map((point) => (
								<li key={point} className="flex gap-2.5">
									<Check className="mt-0.5 size-4 shrink-0 text-success" />
									{point}
								</li>
							))}
						</ul>

						<div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-3 pt-7">
							<Button asChild size="lg" variant={option.primary.variant} className={option.primary.variant === "outline" ? "bg-surface-2" : undefined}>
								<Link href={option.primary.href}>{option.primary.label}</Link>
							</Button>
							{option.secondary && (
								<Link href={option.secondary.href} className="text-[13px] text-signal hover:underline">
									{option.secondary.label} →
								</Link>
							)}
						</div>
					</article>
				))}
			</div>
		</Section>
	);
}
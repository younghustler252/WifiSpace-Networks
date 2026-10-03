import Link from "next/link";
import { ArrowRight, Check, CheckCircle2, Home } from "lucide-react";
import { InfoTile } from "@/components/shared/info-tile";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { company } from "@/config/company";
import { Container } from "./section";

const TRUST = ["Instant activation", "Secure payments by Paystack", "Live usage tracking", "Renew anytime"];

function HeroPreview() {
	return (
		<div className="relative mx-auto mb-10 w-full max-w-md" aria-hidden="true">
			<div className="card-elevated space-y-4 p-5 shadow-xl">
				<div className="flex items-center justify-between gap-3">
					<div className="flex items-center gap-3">
						<span className="flex size-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
							<Home className="size-5" />
						</span>
						<div>
							<p className="text-sm font-medium">Home internet</p>
							<p className="text-mono text-[11px] text-muted-foreground">WSN0042</p>
						</div>
					</div>
					<StatusBadge status="active" />
				</div>

				<div>
					<p className="text-xs text-muted-foreground">Time left</p>
					<p className="text-mono text-3xl font-semibold">29d 12h</p>
				</div>

				<div className="grid grid-cols-2 gap-3">
					<InfoTile label="Speed" value="10 Mbps" />
					<InfoTile label="Data" value="Unlimited" />
				</div>

				<div className="space-y-1.5">
					<div className="flex justify-between text-[11px] text-muted-foreground">
						<span>Time used</span>
						<span>60%</span>
					</div>
					<Progress value={60} className="h-1.5" />
				</div>
			</div>

			<div className="card-elevated absolute -bottom-6 -left-2 flex items-center gap-3 bg-background p-3 shadow-lg sm:-left-8">
				<span className="flex size-8 items-center justify-center rounded-lg bg-success-soft text-success">
					<CheckCircle2 className="size-4" />
				</span>
				<div>
					<p className="text-[12px] font-medium">Payment received</p>
					<p className="text-[11px] text-muted-foreground">Your plan is now active</p>
				</div>
			</div>
		</div>
	);
}

export function Hero() {
	const copy = company.marketing;

	return (
		<section className="relative overflow-hidden">
			<div className="absolute inset-0 grid-bg opacity-40 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
			<div className="absolute -top-32 left-1/2 h-96 w-[40rem] -translate-x-1/2 rounded-full bg-signal/15 blur-3xl" />

			<Container className="relative grid items-center gap-14 py-16 md:py-24 lg:grid-cols-[1.1fr_0.9fr]">
				<div className="space-y-6">
					<div className="inline-flex items-center gap-1.5 rounded-full border border-signal/30 bg-signal/10 px-2.5 py-1 text-[11px] text-signal">
						<span className="status-dot pulse-signal text-signal" />
						Home internet &amp; public wifi
					</div>

					<h1 className="text-4xl font-semibold leading-[1.1] tracking-tight md:text-6xl">
						{copy.heroTitle} <span className="text-signal">{copy.heroHighlight}</span>
					</h1>

					<p className="max-w-xl text-base text-muted-foreground md:text-lg">{copy.heroText}</p>

					<div className="flex flex-col gap-3 sm:flex-row">
						<Button asChild size="lg">
							<Link href="/register">
								Get connected
								<ArrowRight />
							</Link>
						</Button>
						<Button asChild size="lg" variant="outline" className="bg-surface-2">
							<Link href="/pricing">View plans</Link>
						</Button>
					</div>

					<p className="text-[13px] text-muted-foreground">
						Already a customer?{" "}
						<Link href="/login" className="font-medium text-primary hover:underline">
							Sign in
						</Link>
					</p>

					<ul className="grid gap-2 pt-2 text-[13px] text-muted-foreground sm:grid-cols-2">
						{TRUST.map((item) => (
							<li key={item} className="flex items-center gap-2">
								<Check className="size-4 text-success" />
								{item}
							</li>
						))}
					</ul>
				</div>

				<HeroPreview />
			</Container>
		</section>
	);
}
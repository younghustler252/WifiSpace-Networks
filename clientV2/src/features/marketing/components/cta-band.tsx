import Link from "next/link";
import { Button } from "@/components/ui/button";
import { company } from "@/config/company";
import { Container } from "./section";

export function CtaBand() {
	return (
		<section className="pb-16 md:pb-24">
			<Container>
				<div className="card-elevated relative overflow-hidden px-6 py-12 text-center md:py-16">
					<div className="absolute inset-0 grid-bg opacity-30 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
					<div className="absolute left-1/2 top-0 h-48 w-96 -translate-x-1/2 rounded-full bg-signal/15 blur-3xl" />

					<div className="relative mx-auto max-w-xl space-y-4">
						<h2 className="text-2xl font-semibold tracking-tight md:text-4xl">{company.marketing.ctaTitle}</h2>
						<p className="text-[15px] text-muted-foreground md:text-base">{company.marketing.ctaText}</p>
						<div className="flex flex-col justify-center gap-3 pt-2 sm:flex-row">
							<Button asChild size="lg">
								<Link href="/register">Create your account</Link>
							</Button>
							<Button asChild size="lg" variant="outline" className="bg-surface-2">
								<Link href="/pricing">View plans</Link>
							</Button>
						</div>
					</div>
				</div>
			</Container>
		</section>
	);
}
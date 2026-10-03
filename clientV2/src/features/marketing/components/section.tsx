import { cn } from "@/lib/utils";

export function Container({ className, children }: { className?: string; children: React.ReactNode }) {
	return <div className={cn("mx-auto w-full max-w-6xl px-4 md:px-6", className)}>{children}</div>;
}

interface SectionProps {
	id?: string;
	eyebrow?: string;
	title: string;
	description?: string;
	className?: string;
	children: React.ReactNode;
}

export function Section({ id, eyebrow, title, description, className, children }: SectionProps) {
	return (
		<section id={id} className={cn("scroll-mt-20 py-16 md:py-24", className)}>
			<Container>
				<div className="mx-auto mb-10 max-w-2xl text-center md:mb-14">
					{eyebrow && <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.18em] text-signal">{eyebrow}</p>}
					<h2 className="text-2xl font-semibold tracking-tight md:text-4xl">{title}</h2>
					{description && <p className="mt-3 text-[15px] text-muted-foreground md:text-base">{description}</p>}
				</div>
				{children}
			</Container>
		</section>
	);
}
import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { company } from "@/config/company";
import { NAV_LINKS } from "../constants";
import { MobileNav } from "./mobile-nav";
import { Container } from "./section";

export function MarketingNav() {
	return (
		<header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
			<Container className="flex h-16 items-center gap-6">
				<Link href="/" aria-label={`${company.name} home`}>
					<Logo />
				</Link>

				<nav aria-label="Main" className="hidden items-center gap-1 md:flex">
					{NAV_LINKS.map((link) => (
						<Link
							key={link.href}
							href={link.href}
							className="rounded-md px-3 py-2 text-[14px] text-muted-foreground transition-colors hover:text-foreground"
						>
							{link.label}
						</Link>
					))}
				</nav>

				<div className="ml-auto hidden items-center gap-2 md:flex">
					<Button asChild variant="ghost">
						<Link href="/login">Sign in</Link>
					</Button>
					<Button asChild>
						<Link href="/register">Get started</Link>
					</Button>
				</div>

				<div className="ml-auto md:hidden">
					<MobileNav />
				</div>
			</Container>
		</header>
	);
}
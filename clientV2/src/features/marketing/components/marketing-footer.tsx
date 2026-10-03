import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { company } from "@/config/company";
import { Container } from "./section";

const COLUMNS = [
	{
		title: "Product",
		links: [
			{ href: "/pricing", label: "Pricing" },
			{ href: "/pricing?type=pppoe", label: "Home & office" },
			{ href: "/pricing?type=hotspot", label: "Wifi hotspot" },
		],
	},
	{
		title: "Account",
		links: [
			{ href: "/login", label: "Sign in" },
			{ href: "/register", label: "Create account" },
		],
	},
];

const linkClass = "text-[13px] text-muted-foreground transition-colors hover:text-foreground";

export function MarketingFooter() {
	const { contact, legal } = company;
	const hasContact = !!(contact.email || contact.phone || contact.address);
	const legalLinks = [
		legal.termsHref && { href: legal.termsHref, label: "Terms" },
		legal.privacyHref && { href: legal.privacyHref, label: "Privacy" },
	].filter(Boolean) as { href: string; label: string }[];

	return (
		<footer className="border-t bg-sidebar">
			<Container className="py-12">
				<div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
					<div className="max-w-xs space-y-3">
						<Logo />
						<p className="text-[13px] text-muted-foreground">{company.description}</p>
					</div>

					{COLUMNS.map((column) => (
						<nav key={column.title} aria-label={column.title} className="space-y-3">
							<p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{column.title}</p>
							<ul className="space-y-2">
								{column.links.map((link) => (
									<li key={link.href}>
										<Link href={link.href} className={linkClass}>
											{link.label}
										</Link>
									</li>
								))}
							</ul>
						</nav>
					))}

					{hasContact && (
						<div className="space-y-3">
							<p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Contact</p>
							<ul className="space-y-2 text-[13px] text-muted-foreground">
								{contact.email && (
									<li>
										<a href={`mailto:${contact.email}`} className={linkClass}>
											{contact.email}
										</a>
									</li>
								)}
								{contact.phone && (
									<li>
										<a href={`tel:${contact.phone.replace(/\s/g, "")}`} className={linkClass}>
											{contact.phone}
										</a>
									</li>
								)}
								{contact.address && <li>{contact.address}</li>}
							</ul>
						</div>
					)}
				</div>

				<div className="mt-10 flex flex-col gap-3 border-t pt-6 text-[12px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
					<p>
						© {new Date().getFullYear()} {company.name}. All rights reserved.
					</p>
					{legalLinks.length > 0 && (
						<ul className="flex gap-4">
							{legalLinks.map((link) => (
								<li key={link.href}>
									<Link href={link.href} className="hover:text-foreground">
										{link.label}
									</Link>
								</li>
							))}
						</ul>
					)}
				</div>
			</Container>
		</footer>
	);
}
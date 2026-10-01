import Link from "next/link";
import { ChevronRight, Plus, Receipt, Zap } from "lucide-react";
import { SectionCard } from "@/components/shared/section-card";

const ACTIONS = [
	{ href: "/plans", label: "Buy or renew a plan", icon: Zap },
	{ href: "/accounts/new", label: "Add an account", icon: Plus },
	{ href: "/payments", label: "Payment history", icon: Receipt },
];

export function QuickActions() {
	return (
		<SectionCard title="Quick actions">
			<ul className="-my-1.5 divide-y">
				{ACTIONS.map(({ href, label, icon: Icon }) => (
					<li key={href}>
						<Link href={href} className="flex items-center gap-3 py-2.5 text-[13px] transition-colors hover:text-signal">
							<Icon className="size-4 text-signal" />
							{label}
							<ChevronRight className="ml-auto size-4 text-muted-foreground" />
						</Link>
					</li>
				))}
			</ul>
		</SectionCard>
	);
}
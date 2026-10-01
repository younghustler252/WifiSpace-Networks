import Link from "next/link";
import { company } from "@/config/company";

interface AuthFormProps {
	title: string;
	subtitle?: string;
	children: React.ReactNode;
	footer?: React.ReactNode;
}

export function AuthForm({ title, subtitle, children, footer }: AuthFormProps) {
	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
				{subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
			</div>
			<div className="space-y-4">{children}</div>
			{footer && <div className="text-[13px] text-muted-foreground">{footer}</div>}
			<p className="text-[11px] text-muted-foreground/70">
				Secured by {company.name}
				{company.supportHref && (
					<>
						{" · "}
						<Link href={company.supportHref} className="underline hover:text-foreground">
							Need help?
						</Link>
					</>
				)}
			</p>
		</div>
	);
}
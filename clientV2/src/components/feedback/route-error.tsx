"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { StatusMessage } from "@/components/shared/status-message";
import { Button } from "@/components/ui/button";

interface RouteErrorProps {
	error: Error & { digest?: string };
	reset: () => void;
	homeHref: string;
	homeLabel: string;
}

export function RouteError({ error, reset, homeHref, homeLabel }: RouteErrorProps) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<StatusMessage
			icon={AlertTriangle}
			tone="destructive"
			title="Something went wrong"
			text="We hit an unexpected problem loading this page. Try again, and if it keeps happening, come back in a few minutes."
		>
			{error.digest && <p className="text-mono text-xs text-muted-foreground/70">Ref: {error.digest}</p>}
			<Button size="lg" className="w-full" onClick={reset}>
				Try again
			</Button>
			<Button asChild size="lg" variant="outline" className="w-full bg-surface-2">
				<Link href={homeHref}>{homeLabel}</Link>
			</Button>
		</StatusMessage>
	);
}
"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";

interface ErrorPageProps {
	error: Error & { digest?: string };
	reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<main className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-6 text-center">
			<div className="absolute inset-0 grid-bg opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
			<div className="absolute left-1/2 top-1/3 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-destructive/10 blur-3xl" />

			<div className="relative flex flex-col items-center gap-6">
				<Link href="/">
					<Logo />
				</Link>
				<div className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
					<AlertTriangle className="size-7" />
				</div>
				<div className="space-y-2">
					<h1 className="text-2xl font-semibold tracking-tight">Something went wrong</h1>
					<p className="mx-auto max-w-sm text-sm text-muted-foreground">
						We hit an unexpected problem. Try again, and if it keeps happening, come back in a few minutes.
					</p>
					{error.digest && <p className="text-mono text-xs text-muted-foreground/70">Ref: {error.digest}</p>}
				</div>
				<div className="flex flex-col gap-3 sm:flex-row">
					<Button size="lg" onClick={reset}>
						Try again
					</Button>
					<Button asChild size="lg" variant="outline" className="bg-surface-2">
						<Link href="/">Back to home</Link>
					</Button>
				</div>
			</div>
		</main>
	);
}
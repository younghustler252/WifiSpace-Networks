import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
	return (
		<main className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-6 text-center">
			<div className="absolute inset-0 grid-bg opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
			<div className="absolute left-1/2 top-1/3 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-signal/10 blur-3xl" />

			<div className="relative flex flex-col items-center gap-6">
				<Link href="/">
					<Logo />
				</Link>
				<p className="text-mono text-7xl font-semibold text-signal sm:text-8xl">404</p>
				<div className="space-y-2">
					<h1 className="text-2xl font-semibold tracking-tight">Page not found</h1>
					<p className="mx-auto max-w-sm text-sm text-muted-foreground">
						The page you&apos;re looking for doesn&apos;t exist or may have moved.
					</p>
				</div>
				<div className="flex flex-col gap-3 sm:flex-row">
					<Button asChild size="lg">
						<Link href="/">Back to home</Link>
					</Button>
					<Button asChild size="lg" variant="outline" className="bg-surface-2">
						<Link href="/login">Sign in</Link>
					</Button>
				</div>
			</div>
		</main>
	);
}
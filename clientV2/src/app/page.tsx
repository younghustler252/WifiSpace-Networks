export default function HomePage() {
	return (
		<main className="min-h-screen bg-background text-foreground">
			<section className="mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-6 py-20 text-center">
				<div className="max-w-3xl">
					<p className="mb-4 text-sm font-medium uppercase tracking-wider text-primary">
						WiFiSpace Networks
					</p>

					<h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
						Manage your network.
						<br />
						<span className="text-primary">Connect your customers.</span>
					</h1>

					<p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
						A complete platform for managing hotspots, routers, customers,
						subscriptions, payments, usage, and network operations.
					</p>

					<div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
						<a
							href="/login"
							className="rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
						>
							Sign in
						</a>

						<a
							href="/register"
							className="rounded-md border border-input bg-background px-6 py-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
						>
							Create account
						</a>
					</div>
				</div>
			</section>
		</main>
	);
}

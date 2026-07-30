import React from "react";
import Logo from "@/components/ui/Logo";

export default function HotspotLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="min-h-screen bg-background text-foreground grid lg:grid-cols-[1fr_480px]">
			{/* LEFT BRAND PANEL */}
			<section className="hidden lg:flex relative overflow-hidden border-r border-border">
				
				{/* Background effects */}
				<div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-transparent" />

				<div className="absolute -top-40 -left-40 h-[420px] w-[420px] rounded-full bg-accent/20 blur-3xl" />

				<div className="relative z-10 p-10 flex flex-col justify-between w-full">

					{/* Logo */}
					<Logo size="md" />


					{/* Main Message */}
					<div className="max-w-md">

						<div className="
							inline-flex items-center gap-2
							rounded-full
							border border-accent/30
							bg-accent/10
							px-3 py-1
							text-xs
							text-accent
						">
							<span className="
								h-2 w-2 
								rounded-full
								bg-success
								animate-pulse
							"/>

							Connected to WifiSpace Network
						</div>


						<h1 className="
							mt-5
							text-4xl
							font-bold
							tracking-tight
						">
							Get connected.
							Stay online.
						</h1>


						<p className="
							mt-4
							text-muted-foreground
							text-sm
							leading-relaxed
						">
							Access WifiSpace internet services,
							manage your hotspot plans,
							and activate your connection instantly.
						</p>



						{/* Steps */}
						<div className="
							mt-8
							grid
							grid-cols-3
							gap-3
						">

							{[
								"Detect",
								"Choose Plan",
								"Pay",
								"Activate",
								"Connect",
								"Renew",
							].map((item)=>(
								<div
									key={item}
									className="
										ui-card
										!p-3
										text-center
										text-xs
										text-muted-foreground
										bg-card/70
									"
								>
									{item}
								</div>
							))}

						</div>

					</div>


					<div className="
						text-xs
						text-muted-foreground
					">
						Powered by Wifispace Networks
					</div>

				</div>

			</section>



			{/* RIGHT PORTAL */}
			<section className="
				flex
				flex-col
				p-6
				md:p-10
			">

				{/* Mobile logo */}
				<div className="lg:hidden mb-8">
					<Logo />
				</div>


				<div className="
					flex-1
					flex
					items-center
				">

					<div className="
						w-full
						max-w-md
						mx-auto
					">

						{children}

					</div>

				</div>


				<footer className="
					pt-6
					text-center
					text-xs
					text-muted-foreground
				">
					Secure connection • WifiSpace Networks
				</footer>


			</section>

		</div>
	);
}
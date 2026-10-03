export const company = {
	name: "WifiSpace FiberLink",
	tagline: "Internet that works",
	description: "Fast, reliable home and hotspot internet with instant activation and simple billing.",
	supportHref: "",
	contact: { email: "" as string, phone: "" as string, address: "" as string },
	legal: { termsHref: "" as string, privacyHref: "" as string },
	logo: {
		mark: "/brand/logo.png",
		markDark: "",
		wordmark: "",
		wordmarkDark: "",
	},
	currency: { code: "NGN", symbol: "₦", locale: "en-NG" },
	auth: {
		badge: "All networks operational",
		headline: "Get online in seconds,",
		highlight: "stay in control.",
		description:
			"Pick a plan, pay in seconds and track your usage live. Home or hotspot, everything lives in one dashboard.",
	},
	marketing: {
		heroTitle: "Reliable internet for home, work,",
		heroHighlight: "and everywhere in between.",
		heroText:
			"Get a dedicated line installed at your home or office, or hop on a WifiSpace hotspot and pay only for the time you need. Everything lives in one simple dashboard.",
		ctaTitle: "Ready to get connected?",
		ctaText: "Create your account in a minute, or find a WifiSpace hotspot and get online right away.",
	},

} as const;
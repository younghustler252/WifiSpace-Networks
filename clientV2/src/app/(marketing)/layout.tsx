import { MarketingFooter } from "@/features/marketing/components/marketing-footer";
import { MarketingNav } from "@/features/marketing/components/marketing-nav";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex min-h-svh flex-col">
			<a
				href="#main"
				className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm"
			>
				Skip to content
			</a>
			<MarketingNav />
			<main id="main" className="flex-1">
				{children}
			</main>
			<MarketingFooter />
		</div>
	);
}
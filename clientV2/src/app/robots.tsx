import type { MetadataRoute } from "next";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
	return {
		rules: {
			userAgent: "*",
			allow: "/",
			disallow: ["/admin", "/portal", "/overview", "/accounts", "/plans", "/payments", "/profile", "/notifications"],
		},
		sitemap: `${base}/sitemap.xml`,
	};
}
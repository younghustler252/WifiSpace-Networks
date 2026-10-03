export const featureFlags = {
	routerBroadcast: process.env.NEXT_PUBLIC_FF_ROUTER_BROADCAST === "true",
} as const;
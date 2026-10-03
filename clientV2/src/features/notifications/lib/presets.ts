import type { NetworkRouter } from "@/features/routers/types/routers.types";
import type { ComposePreset } from "../types/notifications.types";

export function routerNotice(kind: "outage" | "restored", place: string) {
	if (kind === "outage") {
		return {
			title: `Service issue in ${place}`,
			message: `We're aware of a network issue affecting customers in ${place}. Our team is working to restore service and we'll update you as soon as it's back.`,
		};
	}

	return {
		title: `Service restored in ${place}`,
		message: `Service in ${place} is back to normal. Thank you for your patience.`,
	};
}

export function buildRouterOutagePreset(router: NetworkRouter): ComposePreset {
	return {
		routerIds: [router.id],
		type: "system_alert",
		priority: "HIGH",
		...routerNotice("outage", router.location || router.name),
	};
}
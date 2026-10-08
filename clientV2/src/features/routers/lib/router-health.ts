import type { NetworkRouter } from "../types/routers.types";

export interface RouterProblem {
	title: string;
	text: string;
	tone: "warning" | "danger";
}

export function describeRouterProblem(router: NetworkRouter): RouterProblem | null {
	if (router.status === "online" || router.status === "maintenance") return null;

	switch (router.lastErrorType) {
		case "auth_failed":
			return {
				tone: "warning",
				title: "The router is up, but it rejected our login",
				text: "Customers are probably fine. New activations will fail until the API username or password is corrected.",
			};
		case "connection_refused":
			return {
				tone: "warning",
				title: "The router is up, but its API isn't accepting connections",
				text: "Customers are probably fine. Check that the API service is enabled and the port is right.",
			};
		case "timeout":
			return {
				tone: "danger",
				title: "No response from the router",
				text: "Either the router or the VPN path to it is down. Customers on it may be affected.",
			};
		case "host_unreachable":
			return {
				tone: "danger",
				title: "The router can't be reached",
				text: "The network path to it is down. Customers on it may be affected.",
			};
		case "credentials_missing":
			return { tone: "warning", title: "No API credentials saved", text: "Edit the router and add its API username and password." };
		default:
			return {
				tone: "warning",
				title: "Can't connect to the router's API",
				text: router.lastError || "The reason isn't known yet. Try syncing the router.",
			};
	}
}

export function mayAffectCustomers(router: NetworkRouter) {
	if (router.status === "maintenance") return true;
	if (router.status === "online") return false;
	return router.lastErrorType === "timeout" || router.lastErrorType === "host_unreachable" || router.hostReachable === false;
}

export const routerStatusLabel = (router: NetworkRouter) => (router.status === "offline" ? "API offline" : undefined);
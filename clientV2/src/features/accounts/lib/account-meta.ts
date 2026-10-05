import type { Account } from "../types/accounts.types";
import type { RequestedLocation } from "../types/accounts.types";

export function getAccountTitle(account: Account) {
	if (account.serviceType === "hotspot") return "Wifi hotspot";
	return account.accountType === "business" ? "Business internet" : "Home internet";
}


export function formatLocation(location?: RequestedLocation | null) {
	if (!location) return null;
	return [location.address, location.landmark && `Near ${location.landmark}`, [location.city, location.state].filter(Boolean).join(", ")]
		.filter(Boolean)
		.join(" · ");
}
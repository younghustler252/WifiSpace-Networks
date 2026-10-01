import type { Account } from "../types/accounts.types";

export function getAccountTitle(account: Account) {
	if (account.serviceType === "hotspot") return "Wifi hotspot";
	return account.accountType === "business" ? "Business internet" : "Home internet";
}
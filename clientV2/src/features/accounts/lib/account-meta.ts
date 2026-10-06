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

export const approvalOf = (account: { approvalStatus?: string | null }) => account.approvalStatus ?? "approved";
export const isApproved = (account: { approvalStatus?: string | null }) => approvalOf(account) === "approved";

export function accountBlocker(account: { approvalStatus?: string | null; status?: string }) {
	const approval = approvalOf(account);
	if (approval === "pending") return "Awaiting approval";
	if (approval === "rejected") return "Request rejected";
	if (account.status === "terminated") return "Terminated";
	return null;
}
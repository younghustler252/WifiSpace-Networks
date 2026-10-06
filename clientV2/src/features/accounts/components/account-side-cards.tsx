"use client";

import { DetailList } from "@/components/shared/detail-list";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { NetworkRouter } from "@/features/routers/types/routers.types";
import { formatDate, formatMac, humanize } from "@/lib/format";
import { approvalOf, formatLocation, getAccountTitle } from "../lib/account-meta";
import type { AdminAccount } from "../types/accounts.types";
import { useAccountOwner } from "./owner-cell";

const wrap = (value: string) => <span className="block whitespace-normal break-words">{value}</span>;

export function OwnerCard({ account }: { account: AdminAccount }) {
	const { owner, isLoading } = useAccountOwner(account);

	if (isLoading) return <Skeleton className="h-40 rounded-xl" />;

	const rows = owner
		? [
				{ label: "Name", value: `${owner.firstName ?? ""} ${owner.lastName ?? ""}`.trim() || "—" },
				...(owner.email ? [{ label: "Email", value: <a href={`mailto:${owner.email}`} className="hover:text-signal">{owner.email}</a> }] : []),
				...(owner.phone
					? [{ label: "Phone", value: <a href={`tel:${owner.phone.replace(/\s/g, "")}`} className="text-mono hover:text-signal">{owner.phone}</a> }]
					: []),
				...(owner.address ? [{ label: "Address", value: wrap(owner.address) }] : []),
			]
		: [{ label: "User", value: <span className="text-mono text-[12px]">…{account.userId.slice(-8)}</span> }];

	return (
		<SectionCard title="Owner">
			<DetailList rows={rows} />
		</SectionCard>
	);
}

export function AccountDetailsCard({ account }: { account: AdminAccount }) {
	const isPppoe = account.serviceType === "pppoe";
	const approval = approvalOf(account);

	const rows = [
		{ label: "Account ID", value: <span className="text-mono">{account.wsnId}</span> },
		{ label: "Service", value: getAccountTitle(account) },
		...(isPppoe ? [{ label: "Customer type", value: <span className="capitalize">{account.accountType}</span> }] : []),
		...(isPppoe && account.businessName ? [{ label: "Business", value: account.businessName }] : []),
		...(account.accessMethod ? [{ label: "Access method", value: account.accessMethod === "ppp" ? "PPP" : "IPoE" }] : []),
		...(account.macAddress ? [{ label: "Router MAC", value: <span className="text-mono">{formatMac(account.macAddress)}</span> }] : []),
		...(account.staticIp ? [{ label: "Static IP", value: <span className="text-mono">{account.staticIp}</span> }] : []),
		...(!isPppoe && account.maxDevices !== undefined ? [{ label: "Max devices", value: String(account.maxDevices) }] : []),
		{ label: "Approval", value: <StatusBadge status={approval} /> },
		...(account.approvedAt ? [{ label: "Approved", value: formatDate(account.approvedAt) }] : []),
		...(account.approvalNote && approval !== "approved" ? [{ label: "Note", value: wrap(account.approvalNote) }] : []),
		{ label: "Created", value: formatDate(account.createdAt) },
	];

	return (
		<SectionCard title="Account details">
			<DetailList rows={rows} />
		</SectionCard>
	);
}

export function InstallCard({ account, router }: { account: AdminAccount; router: NetworkRouter | null }) {
	const location = formatLocation(account.requestedLocation);

	const rows = [
		{ label: "Install address", value: location ? wrap(location) : "—" },
		{ label: "Router", value: router ? router.name : "Not assigned yet" },
		...(router
			? [
					{ label: "Router code", value: <span className="text-mono">{router.code}</span> },
					...(router.location ? [{ label: "Router location", value: router.location }] : []),
					{ label: "Router status", value: <StatusBadge status={router.status ?? "offline"} /> },
					...(router.connectionType ? [{ label: "Connection", value: humanize(router.connectionType) }] : []),
				]
			: []),
	];

	return (
		<SectionCard title="Installation" description="Where the service is installed and the router serving it.">
			<DetailList rows={rows} />
		</SectionCard>
	);
}
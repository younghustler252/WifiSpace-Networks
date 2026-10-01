import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/format";
import { getAccountTitle } from "../lib/account-meta";
import type { Account } from "../types/accounts.types";

export function AccountInfo({ account }: { account: Account }) {
	const isPppoe = account.serviceType === "pppoe";

	const rows: { label: string; value: React.ReactNode }[] = [
		{ label: "Account ID", value: <span className="text-mono">{account.wsnId}</span> },
		{ label: "Service", value: getAccountTitle(account) },
		...(isPppoe ? [{ label: "Type", value: <span className="capitalize">{account.accountType}</span> }] : []),
		{ label: "Approval", value: <StatusBadge status={account.approvalStatus} /> },
		{ label: "Status", value: <StatusBadge status={account.status} /> },
		{ label: "Created", value: formatDate(account.createdAt) },
	];

	return (
		<SectionCard title="Account info">
			<dl className="divide-y text-[13px]">
				{rows.map((row) => (
					<div key={row.label} className="flex items-center justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
						<dt className="text-muted-foreground">{row.label}</dt>
						<dd className="text-right">{row.value}</dd>
					</div>
				))}
			</dl>
		</SectionCard>
	);
}
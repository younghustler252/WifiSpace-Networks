import { DetailList } from "@/components/shared/detail-list";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate, formatDateTime, humanize } from "@/lib/format";
import type { UserProfile } from "../types/users.types";
import { RoleBadge } from "./role-badge";

const wrap = (value: string) => <span className="block whitespace-normal break-words">{value}</span>;

export function ContactCard({ user }: { user: UserProfile }) {
	const rows = [
		{ label: "Email", value: <a href={`mailto:${user.email}`} className="hover:text-signal">{user.email}</a> },
		...(user.phone ? [{ label: "Phone", value: <a href={`tel:${user.phone.replace(/\s/g, "")}`} className="text-mono hover:text-signal">{user.phone}</a> }] : []),
		...(user.address ? [{ label: "Address", value: wrap(user.address) }] : []),
		...(user.dateOfBirth ? [{ label: "Date of birth", value: formatDate(user.dateOfBirth) }] : []),
		...(user.gender ? [{ label: "Gender", value: humanize(user.gender) }] : []),
		...(user.nin ? [{ label: "NIN", value: <span className="text-mono">{user.nin}</span> }] : []),
	];

	return (
		<SectionCard title="Contact and identity">
			<DetailList rows={rows} />
		</SectionCard>
	);
}

export function SignInCard({ user }: { user: UserProfile }) {
	const rows = [
		{ label: "Role", value: <RoleBadge role={user.role} /> },
		{ label: "Status", value: <StatusBadge status={user.status} /> },
		{ label: "Email", value: <StatusBadge status={user.isVerified ? "approved" : "pending"} label={user.isVerified ? "Verified" : "Not verified"} /> },
		{ label: "Joined", value: formatDate(user.createdAt) },
		{ label: "Last sign-in", value: user.lastLoginAt ? formatDateTime(user.lastLoginAt) : "Never" },
		{ label: "Profile updated", value: formatDate(user.updatedAt) },
	];

	return (
		<SectionCard title="Sign-in and status">
			<DetailList rows={rows} />
		</SectionCard>
	);
}
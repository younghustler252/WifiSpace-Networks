import Link from "next/link";
import { StatusBadge } from "@/components/shared/status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/format";
import type { UserProfile } from "../types/users.types";
import { RoleBadge } from "./role-badge";
import { UserActionsMenu, type UserAction } from "./user-actions-menu";

interface UsersTableProps {
	items: UserProfile[];
	selfId?: string;
	onAction: (action: UserAction, user: UserProfile) => void;
}

function UserCell({ user }: { user: UserProfile }) {
	const initials = `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase();

	return (
		<div className="flex min-w-0 items-center gap-3">
			<Avatar className="size-8 shrink-0">
				<AvatarImage src={user.avatar?.url} alt="" />
				<AvatarFallback className="bg-signal/15 text-[11px] font-semibold text-signal">{initials}</AvatarFallback>
			</Avatar>
			<div className="min-w-0">
				<Link href={`/admin/users/${user.id}`} className="block truncate text-[13px] font-medium hover:text-signal">
					{user.firstName} {user.lastName}
				</Link>
				<p className="truncate text-[11px] text-muted-foreground">{user.email}</p>
			</div>
		</div>
	);
}

export function UsersTable({ items, selfId, onAction }: UsersTableProps) {
	return (
		<>
			<div className="hidden md:block">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>User</TableHead>
							<TableHead>Role</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Joined</TableHead>
							<TableHead className="w-12" />
						</TableRow>
					</TableHeader>
					<TableBody>
						{items.map((user) => (
							<TableRow key={user.id}>
								<TableCell className="max-w-72">
									<UserCell user={user} />
								</TableCell>
								<TableCell>
									<RoleBadge role={user.role} />
								</TableCell>
								<TableCell>
									<StatusBadge status={user.status} />
								</TableCell>
								<TableCell className="whitespace-nowrap text-[13px] text-muted-foreground">{formatDate(user.createdAt)}</TableCell>
								<TableCell className="text-right">
									<UserActionsMenu user={user} isSelf={user.id === selfId} onAction={(a) => onAction(a, user)} />
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			<ul className="divide-y md:hidden">
				{items.map((user) => (
					<li key={user.id} className="flex items-center gap-2 py-3 first:pt-0 last:pb-0">
						<div className="min-w-0 flex-1 space-y-2">
							<UserCell user={user} />
							<div className="flex flex-wrap items-center gap-2 pl-11">
								<RoleBadge role={user.role} />
								<StatusBadge status={user.status} />
							</div>
						</div>
						<UserActionsMenu user={user} isSelf={user.id === selfId} onAction={(a) => onAction(a, user)} />
					</li>
				))}
			</ul>
		</>
	);
}
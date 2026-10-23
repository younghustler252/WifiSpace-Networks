"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Plus, SearchX, WifiOff } from "lucide-react";
import { InfoTile } from "@/components/shared/info-tile";
import { Notice } from "@/components/shared/notice";
import { StatusMessage } from "@/components/shared/status-message";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { AccountActionDialog } from "@/features/accounts/components/account-dialogs";
import type { AccountAction } from "@/features/accounts/components/account-actions-menu";
import { UserDevicesCard } from "@/features/accounts/components/hotspot-connections";
import { useAdminAccounts } from "@/features/accounts/hooks/use-accounts";
import type { AdminAccount } from "@/features/accounts/types/accounts.types";
import { EntityActivityCard } from "@/features/audit/components/entity-activity-card";
import { AdminWalletCard } from "@/features/wallet/components/admin-wallet-card";
import { LinkedPaymentsCard } from "@/features/payments/components/linked-payments-card";
import { useAdminSubscriptions } from "@/features/subscriptions/hooks/use-subscriptions";
import { getSubscriptionPhase } from "@/features/subscriptions/lib/subscription-phase";
// import { AccountTicketsCard } from "@/features/tickets/components/account-tickets-card";
// import { useAdminTickets } from "@/features/tickets/hooks/use-tickets";
import { ApiError } from "@/lib/api/unwrap";
import { formatDate, formatDateTime, formatNumber } from "@/lib/format";
import { useAuthStore } from "@/stores/auth.store";
import { USER_ERROR_CODES } from "../constants";
import { useAdminUser } from "../hooks/use-users";
import { RoleBadge } from "./role-badge";
import { useUserActionHost } from "./user-action-host";
import { UserAccountsCard } from "./user-accounts-card";
import { UserActionsMenu } from "./user-actions-menu";
import { ContactCard, SignInCard } from "./user-side-cards";

export function UserView({ id }: { id: string }) {
	const me = useAuthStore((s) => s.user);
	const { data: user, isLoading, isError, error, refetch } = useAdminUser(id);
	const accounts = useAdminAccounts({ userId: id, limit: 50 });
	const subscriptions = useAdminSubscriptions({ userId: id, limit: 50 });
	// const tickets = useAdminTickets({ userId: id });
	const host = useUserActionHost();
	const [accountDialog, setAccountDialog] = useState<{ action: AccountAction; account: AdminAccount } | null>(null);

	if (isLoading) {
		return (
			<div className="space-y-6">
				<Skeleton className="h-16 w-80 rounded-lg" />
				<Skeleton className="h-20 rounded-xl" />
				<div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
					<Skeleton className="h-96 rounded-xl" />
					<Skeleton className="h-72 rounded-xl" />
				</div>
			</div>
		);
	}

	if (isError || !user) {
		const notFound = error instanceof ApiError && (error.code === "NOT_FOUND" || error.code === USER_ERROR_CODES.USER_NOT_FOUND);

		if (notFound) {
			return (
				<StatusMessage icon={SearchX} tone="warning" title="User not found" text="This user doesn't exist or has been deleted.">
					<Button asChild size="lg" className="w-full">
						<Link href="/admin/users">Back to users</Link>
					</Button>
				</StatusMessage>
			);
		}

		return (
			<StatusMessage icon={WifiOff} tone="warning" title="We couldn't load this user" text="Check your connection and try again.">
				<Button size="lg" className="w-full" onClick={() => refetch()}>
					Try again
				</Button>
			</StatusMessage>
		);
	}

	const accountItems = accounts.data?.items ?? [];
	const subscriptionItems = subscriptions.data?.items ?? [];
	const activePlans = subscriptionItems.filter((s) => getSubscriptionPhase(s) === "active").length;
	const hasHotspot = accountItems.some((a) => a.serviceType === "hotspot");
	const accountLabels = Object.fromEntries(accountItems.map((a) => [a.id, a.wsnId]));
	const isSelf = user.id === me?.id;
	const initials = `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase();

	return (
		<div className="space-y-6">
			<div className="space-y-4">
				<Link href="/admin/users" className="inline-flex items-center gap-1 text-[12px] text-muted-foreground hover:text-foreground">
					<ChevronLeft className="size-4" />
					Users
				</Link>

				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex items-center gap-4">
						<Avatar className="size-14">
							<AvatarImage src={user.avatar?.url} alt="" />
							<AvatarFallback className="bg-signal/15 text-lg font-semibold text-signal">{initials}</AvatarFallback>
						</Avatar>
						<div className="min-w-0 space-y-1.5">
							<h1 className="truncate text-xl font-semibold tracking-tight md:text-2xl">
								{user.firstName} {user.lastName}
							</h1>
							<div className="flex flex-wrap items-center gap-2">
								<RoleBadge role={user.role} />
								<StatusBadge status={user.status} />
								{isSelf && <span className="text-[11px] text-muted-foreground">This is you</span>}
							</div>
						</div>
					</div>

					<div className="flex items-center gap-2">
						<Button onClick={() => host.handle("add-account", user)}>
							<Plus />
							Add account
						</Button>
						<UserActionsMenu user={user} isSelf={isSelf} onAction={(action) => host.handle(action, user)} />
					</div>
				</div>
			</div>

			{user.status === "banned" && <Notice tone="danger" title="This user is banned" text="They can't sign in until you unban them from the menu above." />}
			{user.status === "suspended" && <Notice tone="warning" title="This user is suspended" text="Their access is on hold." />}
			{!user.isVerified && <Notice tone="warning" title="Email not verified" text="They haven't confirmed their email address yet." />}

			<div className="grid grid-cols-2 gap-3 md:grid-cols-4">
				<InfoTile label="Accounts" value={accounts.data?.meta ? formatNumber(accounts.data.meta.total) : formatNumber(accountItems.length)} />
				<InfoTile label="Active plans" value={formatNumber(activePlans)} hint={`of ${formatNumber(subscriptionItems.length)} plans`} />
				{/* <InfoTile label="Tickets" value={tickets.data?.meta ? formatNumber(tickets.data.meta.total) : "—"} hint="all time" /> */}
				<InfoTile label="Last sign-in" value={user.lastLoginAt ? formatDateTime(user.lastLoginAt) : "Never"} mono={false} />
			</div>

			<div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
				<div className="space-y-4">
					<UserAccountsCard
						accounts={accountItems}
						subscriptions={subscriptionItems}
						loading={accounts.isLoading || subscriptions.isLoading}
						failed={accounts.isError || subscriptions.isError}
						onAdd={() => host.handle("add-account", user)}
						onAction={(action, account) => setAccountDialog({ action, account })}
					/>
					<LinkedPaymentsCard params={{ userId: id }} description="Across all of this customer's accounts." />
					{/* <AccountTicketsCard userId={id} description="Everything this customer has raised." /> */}
					<EntityActivityCard actorId={id} title="Actions by this user" description="What this person did in the system." />
				</div>

				<div className="space-y-4">
					<AdminWalletCard userId={id} />
					<ContactCard user={user} />
					<SignInCard user={user} />
					{hasHotspot && <UserDevicesCard userId={id} accountLabels={accountLabels} />}
					<EntityActivityCard entity="User" entityId={id} title="Changes to this user" />
				</div>
			</div>

			{host.element}
			{accountDialog && <AccountActionDialog action={accountDialog.action} account={accountDialog.account} onClose={() => setAccountDialog(null)} />}
		</div>
	);
}
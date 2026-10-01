import type { DashboardStats } from "../types/dashboard.types";

type Raw = Record<string, unknown>;

const num = (value: unknown) => (typeof value === "number" ? value : 0);
const obj = (value: unknown) => (value && typeof value === "object" ? (value as Raw) : undefined);

export function normalizeDashboard(raw: Raw): DashboardStats {
	const accounts = obj(raw.accounts);
	const subscriptions = obj(raw.subscriptions);
	const users = obj(raw.users);
	const revenue = obj(raw.revenue);
	const payments = obj(raw.payments);

	return {
		accounts: accounts && {
			total: num(accounts.total),
			pending: num(accounts.pending),
			approved: num(accounts.approved),
			rejected: num(accounts.rejected),
			pppoe: num(accounts.pppoe),
			hotspot: num(accounts.hotspot),
			personal: num(accounts.personal),
			business: num(accounts.business),
		},
		activeSubscriptions: subscriptions ? num(subscriptions.active) : undefined,
		pendingApprovals: typeof raw.pendingApprovals === "number" ? raw.pendingApprovals : accounts ? num(accounts.pending) : undefined,
		users: users && { total: num(users.total), customers: num(users.customers) },
		revenue: revenue && { total: num(revenue.total), thisMonth: num(revenue.thisMonth) },
		successfulPayments: payments ? num(payments.successfulCount) : undefined,
	};
}
export interface AccountStats {
	total: number;
	pending: number;
	approved: number;
	rejected: number;
	pppoe: number;
	hotspot: number;
	personal: number;
	business: number;
}

export interface DashboardStats {
	accounts?: AccountStats;
	activeSubscriptions?: number;
	pendingApprovals?: number;
	users?: { total: number; customers: number };
	revenue?: { total: number; thisMonth: number };
	successfulPayments?: number;
}
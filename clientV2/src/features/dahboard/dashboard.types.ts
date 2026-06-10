export interface DashboardStats {
	users: {
		total: number;
		customers: number;
		staff: number;
		superadmins: number;
		active: number;
		suspended: number;
		banned: number;
	};

	accounts: {
		total: number;
		active: number;
		pending: number;
		suspended: number;
		canceled: number;
		pppoe: number;
		hotspot: number;
		personal: number;
		business: number;
	};

	subscriptions: {
		total: number;
		active: number;
		pending: number;
		suspended: number;
		expired: number;
		canceled: number;
		expiringSoon?: number;
		autoRenewEnabled?: number;
		mikrotikSynced?: number;
		mikrotikFailed?: number;
	};
}
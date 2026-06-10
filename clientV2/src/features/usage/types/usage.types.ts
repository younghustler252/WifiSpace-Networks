// ==================================================
// USAGE MODULE TYPES
// ==================================================

// ================================
// CORE SNAPSHOT (BACKEND MODEL)
// ================================

export interface UsageSnapshot {
	accountId: string;
	routerId: string;
	wsnId: string;

	online: boolean;

	ipAddress?: string;
	macAddress?: string;

	uptime: string;

	downloadBytes: number;
	uploadBytes: number;

	lastSeenAt: string;
}

// ================================
// LIST RESPONSE (ADMIN)
// ================================

export interface UsageListResponse {
	data: UsageSnapshot[];

	meta: {
		total: number;
		page: number;
		limit: number;
		pages: number;
	};
}

// ================================
// SYNC DTO (ADMIN TRIGGER)
// ================================

export interface SyncUsageDto {
	routerId: string;
	serviceType?: "pppoe" | "hotspot";
}
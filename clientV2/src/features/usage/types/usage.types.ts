export interface Usage {
	totalBytesUsed: number;
	totalSecondsUsed: number;
	remainingBytes: number | null;
	remainingSeconds: number | null;
	dataUsagePercent: number;
	lastSyncedAt: string | null;
}

export interface UsageStats {
	totalBytesUsed: number;
	totalSecondsUsed: number;
	dataCapBytes: number | null;
	durationSeconds: number | null;
	lastSyncedAt: string | null;
}

export interface UsageRecord {
	id?: string;
	macAddress?: string | null;
	bytesUsed: number;
	secondsUsed: number;
	source?: string;
	recordedAt: string;
}
export interface Usage {
	totalBytesUsed: number;
	totalSecondsUsed: number;
	remainingBytes: number | null;
	remainingSeconds: number | null;
	dataUsagePercent: number;
	lastSyncedAt: string | null;
}
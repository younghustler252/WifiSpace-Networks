export interface PlanSnapshot {
	name: string;
	serviceType?: string;
	price: number;
	durationValue: number;
	durationUnit: string;
	speedRate?: string;
	devicesAllowed?: number;
	gracePeriodDays?: number;
}

export interface Subscription {
	id: string;
	accountId: string;
	planId: string;
	status: string;
	planSnapshot: PlanSnapshot;
	cycles: number;
	totalAmount: number;
	startsAt: string | null;
	expiresAt: string | null;
	graceEndsAt: string | null;
	bonusDays: number;
	renewalStrategy: string;
	autoRenewEnabled: boolean;
	mikrotikStatus?: string;
	createdAt: string;
}
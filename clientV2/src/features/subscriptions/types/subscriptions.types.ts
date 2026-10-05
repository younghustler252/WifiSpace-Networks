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

	// add inside interface Subscription
	userId?: string;
	activatedAt?: string | null;
	suspendedAt?: string | null;
	suspensionReason?: string | null;
	canceledAt?: string | null;
	cancellationReason?: string | null;
	manualAdjustmentDays?: number;
	mikrotikError?: string | null;
}


export interface AdminSubscriptionListParams {
	status?: string;
	page?: number;
	limit?: number;
}

export interface AdminCreateSubscriptionBody {
	accountId: string;
	planId: string;
	cycles?: number;
	activateImmediately?: boolean;
}


export interface UpgradeOption {
	id: string;
	name: string;
	price: number;
	serviceType?: string;
	durationValue: number;
	durationUnit: string;
	speedRate?: string;
	devicesAllowed?: number;
	gracePeriodDays?: number;
}

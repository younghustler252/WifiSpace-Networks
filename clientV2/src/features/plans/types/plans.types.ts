export type PlanServiceType = "pppoe" | "hotspot";

export interface BonusRule {
	minCycles: number;
	bonusDays: number;
}

export interface Plan {
	id: string;
	name: string;
	serviceType: PlanServiceType;
	accountType?: string | null;
	price: number;
	speedRate: string;
	durationValue: number;
	durationUnit: string;
	dataLimitBytes: number;
	devicesAllowed: number;
	features: string[];
	mikrotikProfile?: string;
	gracePeriodDays?: number;
	discountType?: string | null;
	discountValue?: number | null;
	discountValidUntil?: string | null;
	bonusRules?: BonusRule[];
	status: string;
	deletedAt?: string | null;
}

export interface PlanFields {
	name: string;
	price: number;
	speedRate: string;
	durationValue: number;
	durationUnit: string;
	dataLimitBytes: number;
	devicesAllowed: number;
	features: string[];
	mikrotikProfile: string;
	gracePeriodDays?: number;
	discountType?: string;
	discountValue?: number;
	discountValidUntil?: string;
	bonusRules?: BonusRule[];
	accountType?: string;
}

export interface CreatePlanBody extends PlanFields {
	serviceType: PlanServiceType;
}

export type UpdatePlanBody = Partial<PlanFields>;

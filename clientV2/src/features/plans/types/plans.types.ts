export type PlanServiceType = "pppoe" | "hotspot";

export interface Plan {
	id: string;
	name: string;
	serviceType: PlanServiceType;
	price: number;
	speedRate: string;
	durationValue: number;
	durationUnit: string;
	dataLimitBytes: number;
	devicesAllowed: number;
	features: string[];
	status: string;
}
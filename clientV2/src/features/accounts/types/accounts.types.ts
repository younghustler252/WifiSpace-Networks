import type { PlanServiceType } from "@/features/plans/types/plans.types";

export interface AccountDevice {
	macAddress: string;
	hostname: string | null;
	lastSeenAt: string;
}

export interface Account {
	id: string;
	userId: string;
	wsnId: string;
	serviceType: PlanServiceType;
	accountType: "personal" | "business" | (string & {});
	status: string;
	approvalStatus: "pending" | "approved" | "rejected" | (string & {});
	routerProfile?: string | null;
	maxDevices?: number;
	devices?: AccountDevice[];
	createdAt: string;
}

export interface RequestAccountBody {
	serviceType: PlanServiceType;
	accountType?: "personal" | "business";
	businessName?: string;
}

export interface OwnerInfo {
	firstName?: string;
	lastName?: string;
	email?: string;
	phone?: string | null;
	address?: string | null;
}

export interface AdminAccount extends Account {
	user?: OwnerInfo | null;
	routerId?: string | null;
}

export interface AdminAccountListParams {
	serviceType?: string;
	status?: string;
	approvalStatus?: string;
	search?: string;
	page?: number;
	limit?: number;
}
import type { PlanServiceType } from "@/features/plans/types/plans.types";
import { NetworkRouter } from "@/features/routers/types/routers.types";


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
	requestedLocation?: RequestedLocation | null;

	maxDevices?: number;
	devices?: AccountDevice[];
	createdAt: string;
}

export interface RequestAccountBody {
	serviceType: PlanServiceType;
	accountType?: "personal" | "business";
	businessName?: string;
	requestedLocation?: RequestedLocation;
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
	accessMethod?: "ppp" | "ipoe";
	macAddress?: string | null;
	staticIp?: string | null;
	approvalNote?: string | null;
	approvedAt?: string | null;
	businessName?: string | null;
}

export interface AdminAccountListParams {
	userId?: string;
	serviceType?: string;
	status?: string;
	approvalStatus?: string;
	search?: string;
	page?: number;
	limit?: number;
}

export interface RequestedLocation {
	address: string;
	landmark?: string;
	city?: string;
	state?: string;
	coordinates?: unknown;
}

export interface AdminCreateAccountBody {
	userId: string;
	serviceType: PlanServiceType;
	accountType?: "personal" | "business";
	businessName?: string;
	companyRegistrationNumber?: string;
	taxId?: string;
	routerId?: string;
	accessMethod?: "ppp" | "ipoe";
	macAddress?: string;
	staticIp?: string;
	maxDevices?: number;
}

export interface AdminAccountDetailResponse {
	account: AdminAccount;
	router: NetworkRouter | null;
	subscription: unknown;
}
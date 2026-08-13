// ================================
// ACCOUNT TYPES
// ================================

export type AccountType = "personal" | "business";

export type ServiceType = "pppoe" | "hotspot";

export type ApprovalStatus =
	| "pending"
	| "approved"
	| "rejected";

// ================================
// POPULATED USER
// ================================

export interface AccountUser {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	avatar?: {
		url: string;
	};
}

// ================================
// POPULATED APPROVER
// ================================

export interface AccountApprover {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
}

// ================================
// ACCOUNT DEVICE
// ================================

export interface AccountDevice {
	macAddress: string;
	hostname: string | null;
	lastSeenAt: string | null;
}

// ================================
// ACCOUNT
// ================================

export interface Account {
	id: string;

	userId: string;

	user: AccountUser | null;

	accountType: AccountType;

	businessName: string | null;
	companyRegistrationNumber: string | null;
	taxId: string | null;

	wsnId: string;

	routerPassword?: string;

	routerId: string | null;
	routerProfile: string;

	devices: AccountDevice[];

	serviceType: ServiceType;

	approvalStatus: ApprovalStatus;
	approvalNote: string | null;
	approvedAt: string | null;
	approvedBy: string | null;
	approver: AccountApprover | null;

	limitUptime: string;

	createdAt: string;
	updatedAt: string;
}

// ================================
// CREATE ACCOUNT
// ================================

export interface CreateAccountDto {
	userId?: string;

	accountType?: AccountType;

	businessName?: string;
	companyRegistrationNumber?: string;
	taxId?: string;

	wsnId?: string;

	routerPassword?: string;

	routerId?: string;

	routerProfile?: string;

	serviceType?: ServiceType;

	limitUptime?: string;
}

// ================================
// USER UPDATE ACCOUNT
// ================================

export interface UpdateMyAccountDto {
	businessName?: string | null;
	companyRegistrationNumber?: string | null;
	taxId?: string | null;
	routerPassword?: string;
}

// ================================
// ADMIN UPDATE ACCOUNT
// ================================

export interface UpdateAccountDto {
	accountType?: AccountType;

	businessName?: string | null;
	companyRegistrationNumber?: string | null;
	taxId?: string | null;

	routerId?: string | null;
	routerProfile?: string;

	serviceType?: ServiceType;

	limitUptime?: string;
}

// ================================
// REJECT ACCOUNT
// ================================

export interface RejectAccountDto {
	note?: string | null;
}

// ================================
// TRANSFER ACCOUNT
// ================================

export interface TransferAccountDto {
	newOwnerId: string;
}

// ================================
// CHANGE ROUTER PASSWORD
// ================================

export interface ChangeAccountPasswordDto {
	password: string;
}

// ================================
// ADMIN ACCOUNT FILTERS
// ================================

export interface GetAllAccountsParams {
	userId?: string;
	routerId?: string;

	search?: string;

	accountType?: AccountType;

	serviceType?: ServiceType;

	approvalStatus?: ApprovalStatus;

	createdAfter?: string;
	createdBefore?: string;

	sort?: "wsnid_desc" | "wsnid_asc" | "newest" | "oldest";

	page?: number;
	limit?: number;
}


// ================================
// ACCOUNT STATISTICS
// ================================

export interface AccountStats {
	total: number;

	pending: number;
	approved: number;
	rejected: number;

	pppoe: number;
	hotspot: number;

	personal: number;
	business: number;
}
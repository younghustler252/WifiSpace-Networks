// ================================
// GENERIC API RESPONSE
// ================================

export interface ApiResponse<T> {
	success: boolean;
	code: string;
	message: string;
	data: T;
}

// ================================
// AUTH TYPES
// ================================

export interface LoginResponse {
	accessToken: string;
	refreshToken: string;
	user: User;
}



export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: Pagination;
}


// ================================
// USER TYPES
// ================================

export interface User {
	id: string;
	firstName: string;
	lastName: string;
	email: string;

	// core
	role: string;
	status?: string;
	isVerified?: boolean;

	// profile
	avatar?: {
		url?: string;
	};

	phone?: string;
	nin?: string;
	address?: string;
	dateOfBirth?: string;
	gender?: string;

	// permissions / settings
	permissions?: string[];
	theme?: string;
	otpExpiresAt?: number; 
	// timestamps
	lastLoginAt?: string;
	createdAt?: string;
	updatedAt?: string;
}

// ================================
// ACCOUNT TYPES
// ================================

export interface Account {
	id: string;

	// DB reference only
	userId: string;

	// Populated user for UI (IMPORTANT)
	user: {
		_id: string;
		firstName: string;
		lastName: string;
		email: string;
		avatar?: {
			url: string;
		};
	} | null;

	accountType: "personal" | "business";

	businessName?: string;
	companyRegistrationNumber?: string;
	taxId?: string;

	wsnId: string;

	routerId: string;
	routerProfile: string;

	serviceType: "pppoe" | "hotspot";

	profileStatus: "pending" | "active" | "suspended" | "canceled";

	lastSeenAt?: string;
	mikrotikUserCreated: boolean;

	createdAt: string;
	updatedAt: string;
}
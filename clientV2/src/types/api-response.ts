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
// PAGINATION
// ================================

export interface PaginationMeta {
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

// ================================
// PAGINATED API RESPONSE
// ================================

export interface PaginatedResponse<T> {
	success: boolean;
	code: string;
	message: string;
	data: T[];
	meta: PaginationMeta;
}

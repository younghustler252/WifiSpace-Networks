import type { ErrorCode } from "./error-codes";

export interface PaginationMeta {
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

export interface ApiSuccessResponse<T> {
	success: true;
	code: string;
	message: string;
	data: T;
	meta?: PaginationMeta;
}

export interface ApiErrorResponse {
	success: false;
	code: ErrorCode;
	status?: number;
	message: string;
	details?: unknown;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
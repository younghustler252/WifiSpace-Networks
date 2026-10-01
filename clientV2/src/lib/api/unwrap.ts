import { ApiErrorResponse, ApiResponse } from "@/types/api-response";

export class ApiError extends Error {
	code: ApiErrorResponse["code"];
	details: unknown;

	constructor(res: ApiErrorResponse) {
		super(res.message);
		this.name = "ApiError";
		this.code = res.code;
		this.details = res.details ?? null;
	}
}

export function unwrap<T>(res: ApiResponse<T>) {
	if (!res.success) throw new ApiError(res);
	return res;
}
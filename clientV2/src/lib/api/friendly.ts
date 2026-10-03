import type { ApiResponse } from "@/types/api-response";

export function friendly<T>(res: ApiResponse<T>, messages: Record<string, string>): ApiResponse<T> {
	if (res.success) return res;
	const message = messages[res.code];
	return message ? { ...res, message } : res;
}
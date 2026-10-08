import { toast } from "sonner";
import type { ApiErrorResponse } from "@/types/api-response";
import { ERROR_CODES } from "@/types/error-codes";

const AMBIGUOUS_CODES = new Set<string>([
	ERROR_CODES.TIMEOUT,
	ERROR_CODES.NETWORK_ERROR,
	"REQUEST_TIMEOUT",
	"IDEMPOTENCY_KEY_IN_PROGRESS",
	"DUPLICATE_REQUEST",
]);

export function isAmbiguousFailure(res: ApiErrorResponse) {
	if (AMBIGUOUS_CODES.has(res.code)) return true;
	return res.status === undefined || res.status >= 500;
}

export function settleFailure(res: ApiErrorResponse, what = "That action"): boolean {
	if (!isAmbiguousFailure(res)) {
		toast.error(res.message);
		return false;
	}

	toast.warning(`${what} may have gone through`, {
		description: `${res.message} We've refreshed the details. Check them before trying again.`,
		duration: 15_000,
	});
	return true;
}
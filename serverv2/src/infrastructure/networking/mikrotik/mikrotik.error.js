// infrastructure/networking/mikrotik/mikrotik.errors.js
import { ROUTER_ERROR_TYPES } from "../../../modules/router/domain/router.enum.js";

export function classifyRouterError(error) {
	const code = error?.errno || error?.code;
	const message = String(error?.message || "");

	if (code === "CANTLOGIN" || /invalid user name or password|username or password is invalid/i.test(message)) {
		return { type: ROUTER_ERROR_TYPES.AUTH_FAILED, message: "Router is reachable but rejected the API credentials" };
	}
	if (code === "ECONNREFUSED") {
		return { type: ROUTER_ERROR_TYPES.CONNECTION_REFUSED, message: "Router refused the API connection. The API service may be disabled or blocked" };
	}
	if (code === "ETIMEDOUT" || code === "SOCKTMOUT" || /timed out/i.test(message)) {
		return { type: ROUTER_ERROR_TYPES.TIMEOUT, message: "No response from router. It, or the VPN path to it, may be down" };
	}
	if (["EHOSTUNREACH", "ENETUNREACH", "ENOTFOUND", "ECONNRESET"].includes(code)) {
		return { type: ROUTER_ERROR_TYPES.HOST_UNREACHABLE, message: "Router host is unreachable from the server" };
	}
	return { type: ROUTER_ERROR_TYPES.UNKNOWN, message: message || `Unknown router error${code ? ` (${code})` : ""}` };
}
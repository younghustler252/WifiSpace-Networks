import { ValidationError } from "../../../shared/errors/domain.errors.js";

const WSN_ID_PATTERN = /^[A-Z][A-Z0-9-]{2,19}$/;

export function normalizeWsnId(value) {
	const normalized = String(value ?? "").trim().toUpperCase();

	if (!WSN_ID_PATTERN.test(normalized)) {
		throw new ValidationError("WSN ID must be 3 to 20 characters, start with a letter and contain only letters, numbers or dashes (for example WSN1113)", "WSN_ID_INVALID");
	}

	return normalized;
}

export function normalizeRouterPassword(value) {
	const password = String(value ?? "");

	if (password.length < 6 || password.length > 64 || /\s/.test(password)) {
		throw new ValidationError("Router password must be 6 to 64 characters with no spaces", "ROUTER_PASSWORD_INVALID");
	}

	return password;
}

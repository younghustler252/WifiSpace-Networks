// shared/utils/mask-sensitive.js

export function maskNin(value) {
	if (!value) return null;

	if (value.length <= 6) {
		return "****";
	}

	return `${value.slice(0, 4)}****${value.slice(-2)}`;
}
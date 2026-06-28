export function maskNin(value) {
	if (!value) return null;

	const strValue = String(value).trim();

	if (strValue.length <= 6) {
		return "****";
	}

	return `${strValue.slice(0, 4)}****${strValue.slice(-2)}`;
}

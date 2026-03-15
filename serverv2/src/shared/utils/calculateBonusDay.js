// utils/calculateBonusDays.js

export function calculateBonusDays(months) {
	if (!months || months < 1) return 0;

	if (months >= 12) return 30;

	return Math.floor(months / 3) * 7;
}
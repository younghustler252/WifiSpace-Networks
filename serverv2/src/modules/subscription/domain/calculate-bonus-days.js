export function calculateBonusDays(plan, cycles = 1) {
	if (!plan || !plan.bonusRules || plan.bonusRules.length === 0) {
		return 0;
	}

	let bonusDays = 0;

	// 🔥 find best matching rule
	for (const rule of plan.bonusRules) {
		if (cycles >= rule.minCycles) {
			bonusDays = Math.max(bonusDays, rule.bonusDays);
		}
	}

	return bonusDays;
}
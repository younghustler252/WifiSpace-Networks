export function calculateBonusDays(plan, cycles = 1) {
	if (!plan?.bonusRules?.length) return 0;

	let bonusDays = 0;

	for (const rule of plan.bonusRules) {
		if (cycles >= rule.minCycles) {
			const times = Math.floor(cycles / rule.minCycles);
			bonusDays += times * rule.bonusDays;
		}
	}

	return bonusDays;
}
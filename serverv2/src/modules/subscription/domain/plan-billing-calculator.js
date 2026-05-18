export class PlanBillingCalculator {
	static calculate(plan, cycles = 1) {
		const baseDays = this.convertToDays(plan);

		let totalDays = baseDays * cycles;

		const bonusDays = this.calculateBonus(plan, cycles);

		const graceDays = plan.gracePeriodDays || 0;

		return {
			baseDays,
			cycles,
			bonusDays,
			graceDays,
			totalDays: totalDays + bonusDays,
			expiresInDays: totalDays + bonusDays + graceDays
		};
	}

	static calculateBonus(plan, cycles) {
		if (!plan?.bonusRules?.length) return 0;

		let bonus = 0;

		for (const rule of plan.bonusRules) {
			if (cycles >= rule.minCycles) {
				bonus = Math.max(bonus, rule.bonusDays);
			}
		}

		return bonus;
	}

	static convertToDays(plan) {
		const { durationValue, durationUnit } = plan;

		switch (durationUnit) {
			case "minutes":
				return durationValue / (60 * 24);
			case "hours":
				return durationValue / 24;
			case "days":
				return durationValue;
			case "months":
				return durationValue * 30;
			default:
				return durationValue;
		}
	}

	static calculateExpiryDate(plan, cycles = 1, fromDate = new Date()) {
		const result = this.calculate(plan, cycles);

		return new Date(
			fromDate.getTime() +
			result.expiresInDays * 86400000
		);
	}
}
export class PlanBillingCalculator {
	static calculate(plan, cycles = 1) {
		const baseDays = this.convertToDays(plan);

		const totalDays = baseDays * cycles;
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

	static calculateExpiryDate(
		plan,
		cycles = 1,
		fromDate = new Date(),
		manualAdjustmentDays = 0
	) {
		const expiry = new Date(fromDate);

		const bonusDays = this.calculateBonus(plan, cycles);

		switch (plan.durationUnit) {
			case "minutes":
				expiry.setMinutes(
					expiry.getMinutes() + (plan.durationValue * cycles)
				);
				break;

			case "hours":
				expiry.setHours(
					expiry.getHours() + (plan.durationValue * cycles)
				);
				break;

			case "days":
				expiry.setDate(
					expiry.getDate() + (plan.durationValue * cycles)
				);
				break;

			case "months":
				expiry.setMonth(
					expiry.getMonth() + (plan.durationValue * cycles)
				);
				break;

			default:
				throw new Error(`Unsupported duration unit: ${plan.durationUnit}`);
		}

		// Apply bonus days
		if (bonusDays) {
			expiry.setDate(expiry.getDate() + bonusDays);
		}

		// Apply manual adjustment days
		if (manualAdjustmentDays) {
			expiry.setDate(expiry.getDate() + manualAdjustmentDays);
		}
		
		return expiry;
	}
}
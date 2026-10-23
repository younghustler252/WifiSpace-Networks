import { ValidationError } from "../../../shared/errors/domain.errors.js";
import { PAYMENT_ACTIONS } from "./payment.enum.js";

export function resolveActionType({ existingSub, plan, override = null }) {
	if (override) return override;
	if (existingSub?.status !== "active") return PAYMENT_ACTIONS.NEW_SUBSCRIPTION;
	if (String(existingSub.planId) === String(plan.id)) return PAYMENT_ACTIONS.RENEWAL;

	const currentPrice = existingSub.planSnapshot?.price ?? 0;
	if (plan.getEffectivePrice() > currentPrice) return PAYMENT_ACTIONS.UPGRADE;

	throw new ValidationError("Downgrading mid-cycle isn't supported. Pick a new plan when your current subscription renews.", "DOWNGRADE_NOT_ALLOWED");
}

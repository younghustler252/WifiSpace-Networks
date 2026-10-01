// validators/subscription.validators.js
import { z } from "zod";

export const subscribeSchema = z.object({
	accountId: z.string().min(1),
	planId: z.string().min(1),
	cycles: z.number().int().min(1).optional()
});

export const adminCreateSubscriptionSchema = subscribeSchema.extend({
	activateImmediately: z.boolean().optional()
});
// validators
export const changePlanSchema = z.object({ newPlanId: z.string().min(1) });
export const suspendSubscriptionSchema = z.object({ reason: z.string().optional() });
export const cancelSubscriptionSchema = z.object({ reason: z.string().optional() });
export const extendSubscriptionSchema = z.object({
	days: z.number().int().refine((d) => d !== 0, "Days must be non-zero"),
	reason: z.string().optional()
});
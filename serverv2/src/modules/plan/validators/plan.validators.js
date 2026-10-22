import { z } from "zod";
import { SERVICE_TYPE_LIST, PLAN_ACCOUNT_TYPE_LIST, DURATION_UNIT_LIST, DISCOUNT_TYPE_LIST } from "../domain/plan.enum.js";

const bonusRuleSchema = z.object({
	minCycles: z.number().int().min(1),
	bonusDays: z.number().int().min(0)
});

export const createPlanSchema = z.object({
	name: z.string().min(1),
	serviceType: z.enum(SERVICE_TYPE_LIST),
	accountType: z.enum(PLAN_ACCOUNT_TYPE_LIST).optional(),
	price: z.number().min(0),
	speedRate: z.string().min(1),
	durationValue: z.number().int().min(1),
	durationUnit: z.enum(DURATION_UNIT_LIST).optional(),
	dataLimitBytes: z.number().min(0).optional(),
	devicesAllowed: z.number().int().min(1).optional(),
	features: z.array(z.string()).optional(),
	mikrotikProfile: z.string().min(1),
	ipoeProfile: z.string().min(1).nullable().optional(),
	gracePeriodDays: z.number().int().min(0).optional(),
	discountType: z.enum(DISCOUNT_TYPE_LIST).optional(),
	discountValue: z.number().min(0).optional(),
	discountValidUntil: z.coerce.date().optional(),
	bonusRules: z.array(bonusRuleSchema).optional()
});

export const updatePlanSchema = createPlanSchema.partial();
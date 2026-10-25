import { z } from "zod";
import { NO_DISCOUNT } from "../constants";

const isInt = (value: string, min: number) => value.trim() !== "" && Number.isInteger(Number(value)) && Number(value) >= min;
const isNumber = (value: string, min: number) => value.trim() !== "" && !Number.isNaN(Number(value)) && Number(value) >= min;

export const planFormSchema = z
	.object({
		name: z.string().trim().min(1, "Enter a plan name"),
		serviceType: z.enum(["pppoe", "hotspot"]),
		accountType: z.string(),
		price: z.string().refine((v) => isNumber(v, 0), "Enter a valid price"),
		speedRate: z.string().trim().min(1, "Enter a speed, for example 10Mbps"),
		durationValue: z.string().refine((v) => isInt(v, 1), "Enter a whole number, 1 or more"),
		durationUnit: z.string().min(1, "Choose a unit"),
		unlimitedData: z.boolean(),
		dataLimitGb: z.string(),
		devicesAllowed: z.string().refine((v) => isInt(v, 1), "Enter a whole number, 1 or more"),
		gracePeriodDays: z.string().refine((v) => v.trim() === "" || isInt(v, 0), "Enter a whole number, 0 or more"),
		mikrotikProfile: z.string().trim().min(1, "Enter the router profile name"),
		ipoeProfile: z.string().trim(),
		features: z.string(),
		discountType: z.string(),
		discountValue: z.string(),
		discountValidUntil: z.string(),
		bonusRules: z.array(z.object({ minCycles: z.string(), bonusDays: z.string() })),
	})
	.superRefine((v, ctx) => {
		if (!v.unlimitedData && !isNumber(v.dataLimitGb, 0.01)) {
			ctx.addIssue({ code: "custom", path: ["dataLimitGb"], message: "Enter the data limit in GB" });
		}

		if (v.discountType !== NO_DISCOUNT) {
			if (!isNumber(v.discountValue, 0)) {
				ctx.addIssue({ code: "custom", path: ["discountValue"], message: "Enter the discount amount" });
			} else if (v.discountType === "percentage" && Number(v.discountValue) > 100) {
				ctx.addIssue({ code: "custom", path: ["discountValue"], message: "A percentage can't be more than 100" });
			}
		}

		v.bonusRules.forEach((rule, index) => {
			if (!isInt(rule.minCycles, 1)) {
				ctx.addIssue({ code: "custom", path: ["bonusRules", index, "minCycles"], message: "1 or more" });
			}
			if (!isInt(rule.bonusDays, 0)) {
				ctx.addIssue({ code: "custom", path: ["bonusRules", index, "bonusDays"], message: "0 or more" });
			}
		});
	});

export type PlanFormValues = z.infer<typeof planFormSchema>;

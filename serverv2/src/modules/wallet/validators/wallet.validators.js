import { z } from "zod";

export const payWithWalletSchema = z.object({
	accountId: z.string().min(1),
	planId: z.string().min(1),
	cycles: z.number().int().min(1).max(24).optional()
});

export const virtualAccountSchema = z.object({ phone: z.string().min(10).max(20).optional() });

export const reconcileWalletSchema = z.object({
	days: z.number().int().min(1).max(60).optional(),
	apply: z.boolean().optional(),
	requery: z.boolean().optional()
});

export const adjustWalletSchema = z.object({
	direction: z.enum(["credit", "debit"]),
	amount: z.number().positive().max(10000000),
	reason: z.string().min(3).max(200)
});

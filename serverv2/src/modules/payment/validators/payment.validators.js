import { z } from "zod";
import { PAYMENT_GATEWAY_LIST } from "../domain/payment.enum.js";

export const initiatePaymentSchema = z.object({
	accountId: z.string().min(1),
	planId: z.string().min(1),
	cycles: z.number().int().min(1).optional(),
	gateway: z.enum(PAYMENT_GATEWAY_LIST).optional(),
	callbackUrl: z.string().url().optional()
});

// add to payment.validators.js
export const recordPaymentSchema = z.object({
	accountId: z.string().min(1),
	planId: z.string().min(1),
	cycles: z.number().int().min(1).optional(),
	paymentChannel: z.string().optional(),
	note: z.string().optional()
});

export const updatePaymentStatusSchema = z.object({
	status: z.enum(["successful", "failed", "expired"]),
	reason: z.string().optional()
});

export const verifyPaymentSchema = z.object({ reference: z.string().min(1) });
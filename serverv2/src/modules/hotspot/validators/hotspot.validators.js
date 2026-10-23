

// validators/hotspot.validators.js
import { z } from "zod";

export const resolveSessionSchema = z.object({
	macAddress: z.string().min(1),
	routerId: z.string().optional(),
	routerUid: z.string().optional(),
	routerCode: z.string().optional(),
	identity: z.string().optional(),
	ipAddress: z.string().optional(),
});

export const authenticateSchema = z.object({
	email: z.string().email(),
	password: z.string().min(1),
	macAddress: z.string().min(1),
	ipAddress: z.string().optional(),
	userAgent: z.string().optional(),
	routerId: z.string().optional(),
	routerUid: z.string().optional(),
	routerCode: z.string().optional(),
	identity: z.string().optional()
});

export const startHotspotSchema = z.object({
	firstName: z.string().optional(),
	lastName: z.string().optional(),
	email: z.string().email(),
	phone: z.string().optional(),
	planId: z.string().min(1),
	callbackUrl: z.string().url().optional(),
	payWith: z.enum(["gateway", "wallet"]).optional(),
	password: z.string().min(1).optional(),
	macAddress: z.string().min(1),
	ipAddress: z.string().optional(),
	userAgent: z.string().optional(),
	routerId: z.string().optional(),
	routerUid: z.string().optional(),
	routerCode: z.string().optional(),
	identity: z.string().optional()
}).superRefine((data, ctx) => {
	if (data.payWith === "wallet" && !data.password) {
		ctx.addIssue({ code: "custom", path: ["password"], message: "Password is required to pay from the wallet" });
	}
	if (data.payWith !== "wallet" && !data.callbackUrl) {
		ctx.addIssue({ code: "custom", path: ["callbackUrl"], message: "callbackUrl is required" });
	}
});

export const hotspotWalletSchema = z.object({
	email: z.string().email(),
	password: z.string().min(1)
});

export const macAddressSchema = z.object({ macAddress: z.string().min(1) });

export const connectionStatusSchema = z.object({
	reference: z.string().min(1),
	macAddress: z.string().optional()
});
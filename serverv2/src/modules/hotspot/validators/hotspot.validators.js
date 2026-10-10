

// validators/hotspot.validators.js
import { z } from "zod";

export const resolveSessionSchema = z.object({
	macAddress: z.string().min(1),
	routerId: z.string().optional(),
	routerUid: z.string().optional(),
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
	identity: z.string().optional()
});

export const startHotspotSchema = z.object({
	firstName: z.string().optional(),
	lastName: z.string().optional(),
	email: z.string().email(),
	phone: z.string().optional(),
	planId: z.string().min(1),
	callbackUrl: z.string().url(),
	macAddress: z.string().min(1),
	ipAddress: z.string().optional(),
	userAgent: z.string().optional(),
	routerId: z.string().optional(),
	routerUid: z.string().optional(),
	identity: z.string().optional()
});

export const macAddressSchema = z.object({ macAddress: z.string().min(1) });

export const connectionStatusSchema = z.object({
	reference: z.string().min(1),
	macAddress: z.string().optional()
});
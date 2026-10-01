import { z } from "zod";

export const requestAccountSchema = z
	.object({
		serviceType: z.enum(["pppoe", "hotspot"]),
		accountType: z.enum(["personal", "business"]),
		businessName: z.string().trim().optional(),
	})
	.refine((v) => v.serviceType !== "pppoe" || v.accountType !== "business" || !!v.businessName, {
		message: "Enter your business name",
		path: ["businessName"],
	});

export const addDeviceSchema = z.object({
	macAddress: z
		.string()
		.trim()
		.regex(/^([0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}$/, "Use the format AA:BB:CC:DD:EE:FF"),
	hostname: z.string().trim().max(60, "Keep it under 60 characters").optional().or(z.literal("")),
});

export type AddDeviceValues = z.infer<typeof addDeviceSchema>;

export type RequestAccountValues = z.infer<typeof requestAccountSchema>;
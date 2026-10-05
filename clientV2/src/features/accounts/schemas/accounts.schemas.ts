import { z } from "zod";

export const requestAccountSchema = z
	.object({
		serviceType: z.enum(["pppoe", "hotspot"]),
		accountType: z.enum(["personal", "business"]),
		businessName: z.string().trim().optional(),
		address: z.string().trim(),
		landmark: z.string().trim().optional(),
		city: z.string().trim().optional(),
		state: z.string().trim().optional(),
	})
	.superRefine((v, ctx) => {
		if (v.serviceType !== "pppoe") return;
		if (v.address.length < 5) {
			ctx.addIssue({ code: "custom", path: ["address"], message: "Enter the address where we should install" });
		}
		if (v.accountType === "business" && !v.businessName) {
			ctx.addIssue({ code: "custom", path: ["businessName"], message: "Enter your business name" });
		}
	});


export const addDeviceSchema = z.object({
	macAddress: z
		.string()
		.trim()
		.regex(/^([0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}$/, "Use the format AA:BB:CC:DD:EE:FF"),
	hostname: z.string().trim().max(60, "Keep it under 60 characters").optional().or(z.literal("")),
});

const MAC_PATTERN = /^([0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}$/;
const IPV4_PATTERN = /^(\d{1,3}\.){3}\d{1,3}$/;

export const adminCreateAccountSchema = z
	.object({
		serviceType: z.enum(["pppoe", "hotspot"]),
		accountType: z.enum(["personal", "business"]),
		businessName: z.string().trim(),
		companyRegistrationNumber: z.string().trim(),
		taxId: z.string().trim(),
		routerId: z.string(),
		accessMethod: z.enum(["ipoe", "ppp"]),
		macAddress: z.string().trim(),
		staticIp: z.string().trim(),
		maxDevices: z.string().trim(),
	})
	.superRefine((v, ctx) => {
		if (v.serviceType === "hotspot") {
			if (v.maxDevices && !(Number.isInteger(Number(v.maxDevices)) && Number(v.maxDevices) >= 1)) {
				ctx.addIssue({ code: "custom", path: ["maxDevices"], message: "Enter a whole number, 1 or more" });
			}
			return;
		}

		if (!v.routerId) ctx.addIssue({ code: "custom", path: ["routerId"], message: "Choose a router" });
		if (v.accessMethod === "ipoe" && !MAC_PATTERN.test(v.macAddress)) {
			ctx.addIssue({ code: "custom", path: ["macAddress"], message: "Enter the customer router's MAC like AA:BB:CC:DD:EE:FF" });
		}
		if (v.staticIp && !IPV4_PATTERN.test(v.staticIp)) {
			ctx.addIssue({ code: "custom", path: ["staticIp"], message: "Enter a valid IPv4 address" });
		}
		if (v.accountType === "business" && !v.businessName) {
			ctx.addIssue({ code: "custom", path: ["businessName"], message: "Enter the business name" });
		}
	});

export type AdminCreateAccountValues = z.infer<typeof adminCreateAccountSchema>;

export type AddDeviceValues = z.infer<typeof addDeviceSchema>;

export type RequestAccountValues = z.infer<typeof requestAccountSchema>;
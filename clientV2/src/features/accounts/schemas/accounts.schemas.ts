import { z } from "zod";

const IPV4 = /^(\d{1,3}\.){3}\d{1,3}$/;
const isInt = (value: string, min: number) => Number.isInteger(Number(value)) && Number(value) >= min;
const inRange = (value: string, limit: number) => value !== "" && !Number.isNaN(Number(value)) && Math.abs(Number(value)) <= limit;

export const editAccountSchema = z
	.object({
		serviceType: z.enum(["pppoe", "hotspot"]),
		routerId: z.string(),
		routerProfile: z.string().trim(),
		accountType: z.enum(["personal", "business"]),
		businessName: z.string().trim(),
		companyRegistrationNumber: z.string().trim(),
		taxId: z.string().trim(),
		staticIp: z.string().trim(),
		limitUptime: z.string().trim(),
		maxDevices: z.string().trim(),
		address: z.string().trim(),
		landmark: z.string().trim(),
		city: z.string().trim(),
		state: z.string().trim(),
		lat: z.string().trim(),
		lng: z.string().trim(),
	})
	.superRefine((v, ctx) => {
		const fail = (path: keyof typeof v, message: string) => ctx.addIssue({ code: "custom", path: [path], message });

		if (v.serviceType === "hotspot") {
			if (v.maxDevices && !isInt(v.maxDevices, 1)) fail("maxDevices", "Enter a whole number, 1 or more");
			return;
		}

		if (!v.routerId) fail("routerId", "Choose a router");
		if (v.accountType === "business" && !v.businessName) fail("businessName", "Enter the business name");
		if (v.staticIp && !IPV4.test(v.staticIp)) fail("staticIp", "Enter a valid IPv4 address");
		if (v.limitUptime && !isInt(v.limitUptime, 0)) fail("limitUptime", "Enter a whole number, 0 or more");

		const hasCoords = v.lat !== "" || v.lng !== "";
		if (hasCoords && !inRange(v.lat, 90)) fail("lat", "Latitude must be between -90 and 90");
		if (hasCoords && !inRange(v.lng, 180)) fail("lng", "Longitude must be between -180 and 180");
		if ((v.landmark || v.city || v.state || hasCoords) && !v.address) fail("address", "An address is needed to save a location");
	});

export type EditAccountValues = z.infer<typeof editAccountSchema>;

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
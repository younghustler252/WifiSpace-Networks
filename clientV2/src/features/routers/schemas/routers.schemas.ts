import { z } from "zod";

export const SERVICE_OPTIONS = [
	{ value: "pppoe", label: "Home (PPPoE)" },
	{ value: "hotspot", label: "Hotspot" },
] as const;

const isInt = (value: string, min: number) => value.trim() !== "" && Number.isInteger(Number(value)) && Number(value) >= min;

export function makeRouterSchema(isEdit: boolean) {
	return z.object({
		name: z.string().trim().min(1, "Enter a name"),
		host: z.string().trim().min(1, "Enter the router address"),
		port: z.string().refine((v) => v.trim() === "" || (isInt(v, 1) && Number(v) <= 65535), "Enter a valid port"),
		username: z.string().trim().min(1, "Enter the API username"),
		password: isEdit ? z.string() : z.string().min(1, "Enter the API password"),
		supportedServices: z.array(z.enum(["pppoe", "hotspot"])).min(1, "Select at least one service"),
		location: z.string().trim().max(120, "Keep it under 120 characters"),
		connectionType: z.enum(["direct", "vpn"]),
		priority: z.string().refine((v) => v.trim() === "" || isInt(v, 0), "Enter a whole number"),
		maxSessions: z.string().refine((v) => v.trim() === "" || isInt(v, 0), "Enter a whole number"),
		isDefaultRouter: z.boolean(),
		isEnabled: z.boolean(),
		apiEnabled: z.boolean(),
	});
}

export type RouterFormValues = z.infer<ReturnType<typeof makeRouterSchema>>;
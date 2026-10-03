import { z } from "zod";

export const SERVICE_OPTIONS = [
	{ value: "pppoe", label: "Home (PPPoE)" },
	{ value: "hotspot", label: "Hotspot" },
] as const;

export const createRouterSchema = z.object({
	name: z.string().trim().min(1, "Enter a name"),
	host: z.string().trim().min(1, "Enter the router address"),
	port: z.number().int().min(1, "Invalid port").max(65535, "Invalid port").optional(),
	username: z.string().trim().min(1, "Enter the API username"),
	password: z.string().min(1, "Enter the API password"),
	supportedServices: z.array(z.enum(["pppoe", "hotspot"])).min(1, "Select at least one service"),
	location: z.string().trim().max(120, "Keep it under 120 characters").optional(),
	isDefaultRouter: z.boolean(),
});

export type CreateRouterValues = z.infer<typeof createRouterSchema>;
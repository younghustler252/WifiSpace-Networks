import { z } from "zod";
import { SERVICE_TYPE_LIST, CONNECTION_TYPE_LIST } from "../domain/router.enum.js";

export const createRouterSchema = z.object({
	name: z.string().min(1),
	host: z.string().min(1),
	port: z.number().int().optional(),
	username: z.string().min(1),
	password: z.string().min(1),
	supportedServices: z.array(z.enum(SERVICE_TYPE_LIST)).optional(),
	isDefaultRouter: z.boolean().optional(),
	location: z.string().optional(),
	connectionType: z.enum(CONNECTION_TYPE_LIST).optional()
});

export const routerProfilesQuerySchema = z.object({
	serviceType: z.enum(SERVICE_TYPE_LIST)
});
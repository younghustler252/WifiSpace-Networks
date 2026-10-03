import { z } from "zod";
import { ACCOUNT_TYPE_LIST, SERVICE_TYPE_LIST } from "../domain/account.enum.js";

export const requestAccountSchema = z.object({
	serviceType: z.enum(SERVICE_TYPE_LIST),
	accountType: z.enum(ACCOUNT_TYPE_LIST).optional(),
	businessName: z.string().optional(),
	companyRegistrationNumber: z.string().optional(),
	taxId: z.string().optional(),
	requestedLocation: z.object({
		address: z.string().min(1),
		landmark: z.string().optional(),
		city: z.string().optional(),
		state: z.string().optional(),
		coordinates: z.object({ lat: z.number(), lng: z.number() }).optional()
	}).optional()
}).refine((d) => d.serviceType !== SERVICE_TYPES.PPPOE || d.requestedLocation, { message: "requestedLocation is required for PPPoE requests", path: ["requestedLocation"] });

export const adminCreateAccountSchema = z.object({
	userId: z.string().min(1),
	serviceType: z.enum(SERVICE_TYPE_LIST),
	accountType: z.enum(ACCOUNT_TYPE_LIST).optional(),
	businessName: z.string().optional(),
	companyRegistrationNumber: z.string().optional(),
	taxId: z.string().optional(),
	routerId: z.string().optional(),
	routerProfile: z.string().optional(),
	maxDevices: z.number().int().min(1).optional()
})
	.refine((d) => d.serviceType !== SERVICE_TYPES.PPPOE || !!d.routerId, { message: "routerId is required for PPPoE accounts", path: ["routerId"] })
	.refine((d) => d.serviceType === SERVICE_TYPES.PPPOE || (!d.businessName && !d.companyRegistrationNumber && !d.taxId), { message: "Business fields only apply to PPPoE accounts", path: ["businessName"] });

export const rejectAccountSchema = z.object({
	note: z.string().min(1, "A rejection reason is required")
});

export const pauseAccountSchema = z.object({
	note: z.string().optional()
});

export const transferAccountSchema = z.object({
	newOwnerId: z.string().min(1)
});

export const addDeviceSchema = z.object({
	macAddress: z.string().min(1),
	hostname: z.string().optional()
});
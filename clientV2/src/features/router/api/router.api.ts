import { API } from "@/lib/api/client";
import type { ApiResponse } from "@/lib/api/types";

import type {
	CreateRouterDto,
	Router,
	UpdateRouterDto,
} from "./router.types";

export const routerApi = {
	// ================================
	// CRUD
	// ================================

	create: (
		data: CreateRouterDto
	): Promise<ApiResponse<Router>> =>
		API.post("/routers", data),

	list: (): Promise<ApiResponse<Router[]>> =>
		API.get("/routers"),

	update: (
		id: string,
		data: UpdateRouterDto
	): Promise<ApiResponse<Router>> =>
		API.patch(`/routers/${id}`, data),

	remove: (
		id: string
	): Promise<ApiResponse<void>> =>
		API.delete(`/routers/${id}`),

	// ================================
	// ACTIONS
	// ================================

	reboot: (
		id: string
	): Promise<ApiResponse<void>> =>
		API.post(`/routers/${id}/reboot`),

	sync: (
		id: string
	): Promise<ApiResponse<Router>> =>
		API.post(`/routers/${id}/sync`),

	checkStatus: (
		id: string
	): Promise<ApiResponse<any>> =>
		API.get(`/routers/${id}/status`),

	getProfiles: (
		id: string,
		serviceType: "pppoe" | "hotspot"
	): Promise<ApiResponse<any>> =>
		API.get(`/routers/${id}/profiles`, {
			params: {
				serviceType,
			},
		}),
};
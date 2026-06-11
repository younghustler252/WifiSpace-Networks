import { API } from "./client";
import { ApiResponse } from "./types";

// ================================
// ROUTER TYPES
// ================================

export interface Router {
	id: string;
	name: string;
	code: string;
	host: string;
	port: number;
	username: string;
	ssl: boolean;
	routerType: "pppoe" | "hotspot" | "mixed";
	location?: string;
	popName?: string;
	status: "online" | "offline" | "maintenance";
	lastError?: string | null;
	isEnabled: boolean;
	apiEnabled: boolean;
	lastSeenAt?: string;
	lastProvisionSyncAt?: string;
	maxSessions: number;
	currentSessions: number;
	routerOsVersion?: string;
	routerBoard?: string;
	systemIdentity?: string;
	priority: number;
	isDefaultRouter: boolean;
	createdAt: string;
	updatedAt: string;
}

// ================================
// CREATE / UPDATE DTOs
// ================================

export interface CreateRouterDto {
	name: string;
	code: string;
	host: string;
	port?: number;
	username: string;
	password: string;
	ssl?: boolean;
	routerType?: "pppoe" | "hotspot" | "mixed";
	location?: string;
	popName?: string;
	status?: "online" | "offline" | "maintenance";
	isEnabled?: boolean;
	apiEnabled?: boolean;
	maxSessions?: number;
	priority?: number;
	isDefaultRouter?: boolean;
}

export interface UpdateRouterDto extends Partial<CreateRouterDto> {}

// ================================
// ROUTER LIST RESPONSE
// ================================

export interface RouterListResponse {
	data: Router[];
	total: number;
}

// ================================
// ROUTER API
// ================================

export const routerApi = {
	// ============================
	// ADMIN ROUTER CRUD
	// ============================

	// CREATE ROUTER
	create: (
		data: CreateRouterDto
	): Promise<ApiResponse<Router>> =>
		API.post("/admin", data),

	// UPDATE ROUTER
	update: (
		id: string,
		data: UpdateRouterDto
	): Promise<ApiResponse<Router>> =>
		API.put(`/admin/${id}`, data),

	// DELETE ROUTER
	remove: (
		id: string
	): Promise<ApiResponse<null>> =>
		API.delete(`/admin/${id}`),

	// LIST ALL ROUTERS
	getAll: (): Promise<ApiResponse<Router[]>> => API.get("routers/admin"),

	// ============================
	// ROUTER DEVICE ACTIONS
	// ============================

	// CHECK ROUTER STATUS
	checkStatus: (
		id: string
	): Promise<ApiResponse<any>> =>
		API.get(`routers/${id}/status`),

	// REBOOT ROUTER
	reboot: (
		id: string
	): Promise<ApiResponse<any>> =>
		API.post(`routers/${id}/reboot`),

		// ============================
	// ROUTER PROFILES
	// ============================

	getProfiles: (
		id: string,
		serviceType: "pppoe" | "hotspot"
	): Promise<ApiResponse<any>> =>
		API.get(`routers/${id}/profiles`, {
			params: { serviceType },
		}),

	// ============================
	// ACCOUNT OPERATIONS
	// ============================

	// CREATE ROUTER ACCOUNT
	createAccount: (
		accountId: string
	): Promise<ApiResponse<any>> =>
		API.post("/routers/account/create", {
			accountId
		}),

	// PROVISION SUBSCRIPTION
	provisionSubscription: (
		subscriptionId: string
	): Promise<ApiResponse<any>> =>
		API.post("/subscription/provision", {
			subscriptionId
		}),

	// SUSPEND ACCOUNT
	suspendAccount: (
		accountId: string,
		reason?: string
	): Promise<ApiResponse<any>> =>
		API.post("/routers/account/suspend", {
			accountId,
			reason
		}),

	// RESUME ACCOUNT
	resumeAccount: (
		accountId: string
	): Promise<ApiResponse<any>> =>
		API.post("routers/account/resume", {
			accountId
		})
};
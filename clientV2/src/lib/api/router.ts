import { API } from "./client";
import { ApiResponse } from "./types";
// ================================
// ENUM TYPES
// ================================

export type RouterStatus =
	| "online"
	| "offline"
	| "maintenance";

export type SupportedService =
	| "pppoe"
	| "hotspot";

export type ConnectionType =
	| "direct"
	| "agent"
	| "vpn";

export type AgentStatus =
	| "online"
	| "offline";

// ================================
// ROUTER
// ================================

export interface Router {
	id: string;

	// Identity
	name: string;
	code: string;

	// Access
	host: string;
	port: number;
	username: string;
	ssl: boolean;
	routerUid?: string;

	// Capabilities
	supportedServices: SupportedService[];

	// Location
	location?: string;
	siteCode?: string;
	popName?: string;

	// Operational
	status: RouterStatus;
	lastError?: string | null;
	isEnabled: boolean;
	apiEnabled: boolean;
	lastSeenAt?: string;
	lastProvisionSyncAt?: string;

	// Connection
	connectionType: ConnectionType;
	connectorId?: string | null;

	// Capacity
	maxSessions: number;
	currentSessions: number;

	agentStatus: AgentStatus;
	agentLastSeenAt?: string;

	// RouterOS
	routerOsVersion?: string;
	routerBoard?: string;
	systemIdentity?: string;

	// Failover
	priority: number;
	isDefaultRouter: boolean;

	// Timestamps
	createdAt: string;
	updatedAt: string;
}

// ================================
// CREATE DTO
// ================================

export interface CreateRouterDto {
	// Identity
	name: string;
	code: string;

	// Access
	host: string;
	port?: number;
	username: string;
	password: string;
	ssl?: boolean;

	// Capability
	supportedServices?: SupportedService[];

	// Location
	location?: string;
	siteCode?: string;
	popName?: string;

	// Operational
	isEnabled?: boolean;
	apiEnabled?: boolean;

	// Connection
	connectionType?: ConnectionType;
	connectorId?: string | null;

	// Capacity
	maxSessions?: number;

	// Failover
	priority?: number;
	isDefaultRouter?: boolean;
}

// ================================
// UPDATE DTO
// ================================

export interface UpdateRouterDto
	extends Partial<CreateRouterDto> {}

// ================================
// RESPONSES
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
		API.post("routers/admin", data),

	// UPDATE ROUTER
	update: (
		id: string,
		data: UpdateRouterDto
	): Promise<ApiResponse<Router>> =>
		API.put(`routers/admin/${id}`, data),

	// DELETE ROUTER
	remove: (
		id: string
	): Promise<ApiResponse<null>> =>
		API.delete(`/admin/${id}`),

	// LIST ALL ROUTERS
	getAll: async (): Promise<Router[]> => {
		const response = await API.get("routers/admin");
		return response.data;
	},
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
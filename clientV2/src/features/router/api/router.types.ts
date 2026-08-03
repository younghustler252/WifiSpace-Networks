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
	routerUid?: string;

	username: string;
	password?: string;
	ssl: boolean;

	// Services
	supportedServices: SupportedService[];

	// Location
	location?: string;
	siteCode?: string;
	popName?: string;

	// Status
	status: RouterStatus;
	lastError?: string | null;

	isEnabled: boolean;
	apiEnabled: boolean;

	lastSeenAt?: string;
	lastProvisionSyncAt?: string;

	// Connection
	connectionType: ConnectionType;

	// Capacity
	maxSessions: number;
	currentSessions: number;

	// Agent
	agentStatus: AgentStatus;
	agentLastSeenAt?: string;

	// RouterOS
	routerOsVersion?: string;
	routerBoard?: string;
	systemIdentity?: string;

	// Failover
	priority: number;
	isDefaultRouter: boolean;

	// Dates
	createdAt: string;
	updatedAt: string;
}

// ================================
// CREATE DTO
// ================================

export interface CreateRouterDto {
	name: string;
	code: string;

	host: string;
	port?: number;

	username: string;
	password: string;

	ssl?: boolean;

	supportedServices?: SupportedService[];

	location?: string;
	siteCode?: string;
	popName?: string;

	isEnabled?: boolean;
	apiEnabled?: boolean;

	connectionType?: ConnectionType;

	maxSessions?: number;

	priority?: number;
	isDefaultRouter?: boolean;
}

// ================================
// UPDATE DTO
// ================================

export type UpdateRouterDto = Partial<CreateRouterDto>;

// ================================
// RESPONSES
// ================================

export interface RouterListResponse {
	data: Router[];
	total: number;
}
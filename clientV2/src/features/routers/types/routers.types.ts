export interface NetworkRouter {
	id: string;
	name: string;
	code: string;
	host?: string;
	port?: number;
	ssl?: boolean;
	routerUid?: string | null;
	supportedServices?: string[];
	location?: string | null;
	popName?: string | null;
	status?: string;
	lastError?: string | null;
	isEnabled?: boolean;
	lastSeenAt?: string | null;
	connectionType?: string;
	maxSessions?: number;
	currentSessions?: number;
	agentStatus?: string | null;
	routerOsVersion?: string | null;
	systemIdentity?: string | null;
	isDefaultRouter?: boolean;
	createdAt?: string;
}

export interface CreateRouterBody {
	name: string;
	host: string;
	port?: number;
	username: string;
	password: string;
	supportedServices?: string[];
	isDefaultRouter?: boolean;
	location?: string;
}
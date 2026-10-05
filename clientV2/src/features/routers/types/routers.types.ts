export interface NetworkRouter {
	id: string;
	name: string;
	code: string;
	host?: string;
	port?: number;
	username?: string;
	ssl?: boolean;
	routerUid?: string | null;
	supportedServices?: string[];
	location?: string | null;
	popName?: string | null;
	status?: string;
	lastError?: string | null;
	isEnabled?: boolean;
	apiEnabled?: boolean;
	lastSeenAt?: string | null;
	connectionType?: string;
	maxSessions?: number;
	currentSessions?: number;
	routerOsVersion?: string | null;
	systemIdentity?: string | null;
	priority?: number;
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
	connectionType?: string;
}

export interface UpdateRouterBody extends Partial<CreateRouterBody> {
	priority?: number;
	maxSessions?: number;
	isEnabled?: boolean;
	apiEnabled?: boolean;
}
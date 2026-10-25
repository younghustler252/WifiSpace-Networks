export type SyncStatus = "synced" | "partial" | "failed" | "never";
export type ConfigResources = "all" | "profiles" | "walled-garden";

export interface SyncCounts {
	created?: number;
	updated?: number;
	removed?: number;
	unchanged?: number;
	skipped?: number;
	failed?: number;
}

export interface SyncFailure {
	name: string;
	error: string;
}

export interface SyncBlock {
	status: SyncStatus;
	outOfDate: boolean;
	lastRunAt: string | null;
	lastSuccessAt: string | null;
	error: string | null;
	counts: SyncCounts;
	failures: SyncFailure[];
}

export interface RouterSyncStatus {
	id: string;
	name: string;
	code: string;
	status: string;
	profiles: SyncBlock;
	walledGarden: SyncBlock;
}

export interface NetworkStatus {
	routers: RouterSyncStatus[];
}

export type OpenStatusPage = "always" | "http-login" | "not-http";

export interface HotspotProfile {
	id: string;
	name: string;
	uploadMbps: number;
	downloadMbps: number;
	rateLimit: string;
	sharedUsers: number;
	macCookieTimeout: string;
	idleTimeout: string;
	statusAutorefresh: string;
	addMacCookie: boolean;
	transparentProxy: boolean;
	openStatusPage: OpenStatusPage;
	advertise: boolean;
	description: string | null;
	createdAt: string;
	updatedAt: string;
	usedByPlans: { id: string; name: string; serviceType: string }[];
}

export interface HotspotProfileFields {
	uploadMbps: number;
	downloadMbps: number;
	sharedUsers?: number;
	macCookieTimeout?: string;
	idleTimeout?: string;
	statusAutorefresh?: string;
	addMacCookie?: boolean;
	transparentProxy?: boolean;
	openStatusPage?: OpenStatusPage;
	advertise?: boolean;
	description?: string | null;
}

export interface CreateHotspotProfileBody extends HotspotProfileFields {
	name: string;
}

export type WalledGardenKind = "host" | "ip";

export interface WalledGardenEntry {
	id: string;
	kind: WalledGardenKind;
	dstHost: string | null;
	dstAddress: string | null;
	protocol: string | null;
	dstPort: string | null;
	path: string | null;
	action: string;
	description: string | null;
	enabled: boolean;
}

export interface WalledGardenFields {
	dstHost?: string | null;
	dstAddress?: string | null;
	protocol?: string | null;
	dstPort?: string | null;
	path?: string | null;
	action?: string;
	description?: string | null;
	enabled?: boolean;
}

export interface CreateWalledGardenBody extends WalledGardenFields {
	kind: WalledGardenKind;
}

export interface ImportBody {
	resources: ConfigResources;
	routerId?: string;
	apply: boolean;
}

export interface ImportResult {
	mode: "preview" | "applied";
	routers: string[];
	unreachable: { router: string; error: string }[];
	profiles: {
		imported: { name: string; rateLimit: string; from: string }[];
		alreadyManaged: number;
		skipped: { name: string; router: string; reason: string }[];
		conflicts: { name: string; router: string; note: string }[];
	};
	walledGarden: {
		imported: { kind: string; target: string; port: string | null; action: string }[];
		alreadyManaged: number;
	};
}

export interface SyncBody {
	routerId?: string;
	resources?: ConfigResources;
	dryRun?: boolean;
}

export interface SyncQueued {
	queued: number;
}

type NamedChange = string | { name: string; changes?: Record<string, string> };

export interface SyncResourceResult {
	created?: NamedChange[];
	updated?: NamedChange[];
	removed?: NamedChange[];
	unchanged?: number;
	skipped?: { name: string; reason: string }[];
	failed?: { name: string; error: string }[];
	error?: string;
}

export interface SyncOneResult {
	routerId: string;
	router: string;
	dryRun: boolean;
	skipped?: string;
	error?: string;
	profiles?: SyncResourceResult;
	walledGarden?: SyncResourceResult;
}
